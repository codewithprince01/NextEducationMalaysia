import { prisma } from '@/lib/db';
import { SITE_VAR } from '../utils/constants';
import type { InquiryPayload } from '../types';
import { sendLeadEmail } from '../email/send-lead-email';

// Columns that only exist on CRM databases which have added them. They are
// skipped instead of breaking the insert everywhere else.
const OPTIONAL_LEAD_COLUMNS = new Set(['interested_university']);

/**
 * Enterprise Inquiry Service (Singleton)
 */
export class InquiryService {
  private static instance: InquiryService;
  private leadColumnsPromise: Promise<Set<string>> | null = null;

  private constructor() {}

  static getInstance(): InquiryService {
    if (!InquiryService.instance) {
      InquiryService.instance = new InquiryService();
    }
    return InquiryService.instance;
  }

  /**
   * General lead creation with auto-assignment and email notifications.
   */
  async createLead(data: {
    name: string;
    email: string;
    country_code: string;
    mobile: string;
    source: string;
    source_path: string;
    nationality?: string;
    university_id?: string;
    university?: string;
    university_slug?: string;
    interested_program?: string;
    interested_course_category?: string;
    interest?: string;
    highest_qualification?: string;
    message?: string;
    dayslot?: string;
    timeslot?: string;
    time_zone?: string;
    brochure_status?: string;
    extra_fields?: Record<string, unknown>;
  }) {
    const [university, leadColumns] = await Promise.all([
      this.resolveUniversity(data),
      this.getLeadColumns(),
    ]);

    const fields: Array<[string, unknown]> = [
      ['name', data.name],
      ['email', data.email],
      ['country_code', data.country_code],
      ['mobile', data.mobile],
      ['source', data.source],
      ['source_path', data.source_path],
      ['nationality', data.nationality || null],
      ['university_id', university.id],
      ['interested_university', university.name],
      ['interested_program', data.interested_program || null],
      ['interested_course_category', data.interested_course_category || null],
      ['highest_qualification', data.highest_qualification || null],
      ['message', data.message || null],
      ['dayslot', data.dayslot || null],
      ['timeslot', data.timeslot || null],
      ['time_zone', data.time_zone || null],
      ['brochure_status', data.brochure_status || null],
      ['website', SITE_VAR],
    ];

    const usable = fields.filter(
      ([column]) => !OPTIONAL_LEAD_COLUMNS.has(column) || leadColumns.has(column)
    );

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO leads
      (${usable.map(([column]) => column).join(', ')}, status, created_at, updated_at)
      VALUES (${usable.map(() => '?').join(', ')}, 1, NOW(), NOW())
      `,
      ...usable.map(([, value]) => value)
    );

    const insertedIdRows = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`) as any[];
    const lead = { id: Number(insertedIdRows?.[0]?.id || 0) };

    // Keep request latency low: assign counselor in background.
    void this.autoAssign(lead.id).catch((error) => {
      console.error('[InquiryService] Auto-assign failed:', error);
    });

    const emailPayload: InquiryPayload = {
      name: data.name,
      email: data.email,
      country_code: data.country_code,
      mobile: data.mobile,
      source: data.source,
      source_path: data.source_path,
      nationality: data.nationality,
      university: university.name,
      program: data.interested_program || null,
      interest: data.interest || data.interested_course_category || null
    };

    // Dispatch email in background so form submissions stay fast and non-blocking.
    void this.sendInquiryEmails(emailPayload, data.extra_fields || null).catch((error) => {
      console.error('[InquiryService] Lead email dispatch failed:', error);
    });

    return lead;
  }

  /**
   * Works out which university a lead is about. Forms send the slug taken from
   * the page URL, which is the only identifier a public form can be trusted to
   * know; the id and the exact name come from the database so the CRM record
   * matches the university record instead of a prettified slug.
   */
  private async resolveUniversity(data: {
    university_id?: string;
    university?: string;
    university_slug?: string;
  }): Promise<{ id: number | null; name: string | null }> {
    const explicitId = Number(data.university_id);
    let id = Number.isFinite(explicitId) && explicitId > 0 ? explicitId : null;
    let name = String(data.university || '').trim() || null;

    const slug = String(data.university_slug || '').trim();
    if (!slug && !id) return { id, name };

    try {
      const rows = (await (slug
        ? prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE uname = ? LIMIT 1`, slug)
        : prisma.$queryRawUnsafe(`SELECT id, name FROM universities WHERE id = ? LIMIT 1`, id))) as any[];

      const row = rows?.[0];
      if (row) {
        id = id || Number(row.id) || null;
        name = String(row.name || '').trim() || name;
      }
    } catch (error) {
      // A lookup failure must never cost us the lead — fall back to whatever
      // the form sent.
      console.error('[InquiryService] University lookup failed:', error);
    }

    return { id, name: name ? name.slice(0, 190) : null };
  }

  /**
   * Cached list of columns the leads table actually has, so optional CRM
   * columns can be written where they exist without breaking installs missing them.
   */
  private async getLeadColumns(): Promise<Set<string>> {
    if (!this.leadColumnsPromise) {
      this.leadColumnsPromise = prisma
        .$queryRawUnsafe(`SHOW COLUMNS FROM leads`)
        .then((rows) => new Set((rows as any[]).map((row) => String(row.Field))))
        .catch((error) => {
          // Do not cache a failed probe: a transient blip would otherwise drop
          // the optional columns for the rest of the process lifetime.
          this.leadColumnsPromise = null;
          console.error('[InquiryService] Unable to read leads columns:', error);
          return new Set<string>();
        });
    }
    return this.leadColumnsPromise;
  }

  private async autoAssign(leadId: number) {
    const counselors = await prisma.$queryRawUnsafe(
      `SELECT id FROM users WHERE role LIKE ? ORDER BY id ASC LIMIT 1`,
      '%counselor%'
    ) as any[];

    const clrId = Number(counselors?.[0]?.id || 8);

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO asigned_leads (clr_id, std_id, status, lead_type, created_at, updated_at)
      VALUES (?, ?, 1, 'new', NOW(), NOW())
      `,
      clrId,
      leadId
    );

    await prisma.$executeRawUnsafe(`UPDATE leads SET asigned = 1 WHERE id = ?`, leadId);
  }

  /**
   * Helper to send both admin + user standardized lead emails.
   */
  private async sendInquiryEmails(data: InquiryPayload, extraFields?: Record<string, unknown> | null) {
    // `source` records WHERE a lead came from — it resolves to the page label,
    // so a brochure request and a fee-structure request sent from the same
    // university page carry an identical source. Using it as the form type made
    // every such lead arrive as a "General" enquiry with nothing in the subject
    // to say what was actually asked for. The form states its own type, so that
    // wins; source stays as the fallback for callers that send no form type.
    const submittedType = [extraFields?.formType, extraFields?.requestfor]
      .map((value) => String(value ?? "").trim())
      .find(Boolean);

    await sendLeadEmail({
      name: data.name,
      email: data.email,
      phone: `${data.country_code ? `+${data.country_code} ` : ''}${data.mobile}`.trim(),
      nationality: data.nationality || null,
      university: data.university || null,
      message: data.interest || data.program || null,
      formType: submittedType || data.source || null,
      sourceUrl: data.source_path || '/',
      extraFields: {
        ...(extraFields || {}),
        // Kept as its own row so the page-level tracking the source label carries
        // is not lost now that Form Type reports the request instead.
        source: data.source || null,
        interested_program: data.program || null,
        interested_course_category: data.interest || null,
      },
    });
  }
}

export const inquiryService = InquiryService.getInstance();
