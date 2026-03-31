import { prisma } from '@/lib/db';
import { SITE_VAR } from '../utils/constants';
import type { InquiryPayload } from '../types';
import { sendLeadEmail } from '../email/send-lead-email';

/**
 * Enterprise Inquiry Service (Singleton)
 */
export class InquiryService {
  private static instance: InquiryService;

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
    const universityId = data.university_id ? Number(data.university_id) : null;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO leads
      (name, email, country_code, mobile, source, source_path, nationality, university_id, interested_program, interested_course_category, highest_qualification, message, dayslot, timeslot, time_zone, brochure_status, website, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
      data.name,
      data.email,
      data.country_code,
      data.mobile,
      data.source,
      data.source_path,
      data.nationality || null,
      universityId,
      data.interested_program || null,
      data.interested_course_category || null,
      data.highest_qualification || null,
      data.message || null,
      data.dayslot || null,
      data.timeslot || null,
      data.time_zone || null,
      data.brochure_status || null,
      SITE_VAR
    );

    const insertedIdRows = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() AS id`) as any[];
    const lead = { id: Number(insertedIdRows?.[0]?.id || 0) };

    await this.autoAssign(lead.id);

    const universityRows = universityId
      ? await prisma.$queryRawUnsafe(`SELECT name FROM universities WHERE id = ? LIMIT 1`, universityId) as any[]
      : [];
    const university = universityRows?.[0] || null;

    const emailPayload: InquiryPayload = {
      name: data.name,
      email: data.email,
      country_code: data.country_code,
      mobile: data.mobile,
      source: data.source,
      source_path: data.source_path,
      nationality: data.nationality,
      university: university?.name || data.university || null,
      program: data.interested_program || null,
      interest: data.interest || data.interested_course_category || null
    };

    try {
      await this.sendInquiryEmails(emailPayload, data.extra_fields || null);
    } catch (error) {
      console.error('Failed to send inquiry emails:', error);
    }

    return lead;
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
    await sendLeadEmail({
      name: data.name,
      email: data.email,
      phone: `${data.country_code ? `+${data.country_code} ` : ''}${data.mobile}`.trim(),
      nationality: data.nationality || null,
      university: data.university || null,
      message: data.interest || data.program || null,
      formType: data.source || null,
      sourceUrl: data.source_path || '/',
      extraFields: {
        ...(extraFields || {}),
        interested_program: data.program || null,
        interested_course_category: data.interest || null,
      },
    });
  }
}

export const inquiryService = InquiryService.getInstance();
