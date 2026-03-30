import { prisma } from '@/lib/db';
import { sendMail } from '../email/sender';
import { SITE_VAR } from '../utils/constants';
import { inquiryReplyHtml } from '../email/templates/inquiry-reply';
import { inquiryToTeamHtml } from '../email/templates/inquiry-to-team';
import type { InquiryPayload } from '../types';

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
  }) {
    const universityId = data.university_id ? Number(data.university_id) : null;

    // 1. Create the lead (raw SQL keeps compatibility with current DB schema/client typings)
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

    // 2. Auto assign lead
    await this.autoAssign(lead.id);

    // 3. Send emails
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

    // We'll use a try-catch for emails so the lead creation doesn't fail if SMTP is down
    try {
      await this.sendInquiryEmails(emailPayload);
    } catch (error) {
      console.error('Failed to send inquiry emails:', error);
    }

    return lead;
  }

  /**
   * Simplified auto-assignment logic.
   */
  private async autoAssign(leadId: number) {
    // Pick first user with 'counselor' in their role
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

    // Update lead asigned status
    await prisma.$executeRawUnsafe(`UPDATE leads SET asigned = 1 WHERE id = ?`, leadId);
  }

  /**
   * Helper to send both user reply and team notification.
   */
  private async sendInquiryEmails(data: InquiryPayload) {
    // User Reply
    await sendMail({
      to: data.email,
      toName: data.name,
      subject: 'We have Received Your Request – Expect a Response Soon',
      html: inquiryReplyHtml(data),
      priority: 'high'
    });

    // Team Alert
    await sendMail({
      to: process.env.TO_EMAIL || 'leads@educationmalaysia.in',
      cc: process.env.CC_EMAIL,
      subject: `New Enquiry Alert [${data.source}] – Team Attention Needed`,
      html: inquiryToTeamHtml(data),
      priority: 'high'
    });
  }
}

export const inquiryService = InquiryService.getInstance();
