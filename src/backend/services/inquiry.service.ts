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
    // 1. Create the lead
    const lead = await prisma.leads.create({
      data: {
        name: data.name,
        email: data.email,
        country_code: data.country_code,
        mobile: data.mobile,
        source: data.source,
        source_path: data.source_path,
        nationality: data.nationality,
        university_id: data.university_id ? BigInt(data.university_id) : null,
        interested_program: data.interested_program,
        interested_course_category: data.interested_course_category,
        highest_qualification: data.highest_qualification,
        message: data.message,
        dayslot: data.dayslot,
        timeslot: data.timeslot,
        time_zone: data.time_zone,
        brochure_status: data.brochure_status,
        website: SITE_VAR,
        status: 1
      }
    });

    // 2. Auto assign lead
    await this.autoAssign(lead.id);

    // 3. Send emails
    const university = data.university_id 
      ? await prisma.university.findUnique({ where: { id: BigInt(data.university_id) }, select: { name: true } })
      : null;

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
  private async autoAssign(leadId: bigint) {
    // Pick first user with 'counselor' in their role
    const counselor = await prisma.users.findFirst({
      where: { role: { contains: 'counselor' } }
    });

    const clrId = counselor?.id || BigInt(8);

    await prisma.asigned_leads.create({
      data: {
        clr_id: clrId,
        std_id: leadId,
        status: 1,
        lead_type: 'new'
      }
    });

    // Update lead asigned status
    await prisma.leads.update({
      where: { id: leadId },
      data: { asigned: true }
    });
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
