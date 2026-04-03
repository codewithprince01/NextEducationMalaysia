import { NextRequest } from 'next/server';
import { 
  withMiddleware, apiSuccess, apiError, serializeBigInt } from '@/backend';
import { prisma } from '@/lib/db-fresh';
import { sendLeadEmail } from '@/backend/email/send-lead-email';
import { buildLeadSource } from '@/backend/utils/lead-source';

export const POST = withMiddleware()(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({} as any));

    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 190);
    const mobile = String(body.mobile || '').trim().slice(0, 20);
    const countryCode = String(body.country_code || '91').replace('+', '').trim().slice(0, 8) || '91';
    const nationality = String(body.nationality || '').trim().slice(0, 100);
    const highestQualification = String(body.highest_qualification || '').trim().slice(0, 160);
    const interestedCourseCategory = String(body.interested_course_category || '').trim().slice(0, 160);
    const sourceMeta = buildLeadSource({
      formType: body.formType || 'Malaysia Calling Popup',
      source: body.source || 'Malaysia Calling Popup',
      requestfor: body.requestfor,
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });
    const website = process.env.SITE_VAR || 'MYS';

    const errors: Record<string, string[]> = {};

    if (!name) errors.name = ['Name is required'];
    else if (!/^[a-zA-Z ]+$/.test(name)) errors.name = ['Name should contain letters only'];

    if (!email) errors.email = ['Email is required'];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Please enter a valid email'];

    if (!countryCode || !/^\d+$/.test(countryCode)) errors.country_code = ['Country code must be numeric'];
    if (!mobile || !/^\d+$/.test(mobile)) errors.mobile = ['Mobile must be numeric'];
    if (!highestQualification) errors.highest_qualification = ['Highest qualification is required'];
    if (!interestedCourseCategory) errors.interested_course_category = ['Interested course category is required'];
    if (!nationality) errors.nationality = ['Nationality is required'];

    if (Object.keys(errors).length > 0) {
      return apiError('Validation failed', 422, { errors });
    }

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM leads WHERE email = ? AND website = ? ORDER BY id DESC LIMIT 1`,
      email,
      website
    );
    if (existing.length > 0) {
      return apiError('This email is already registered. Please use another email.', 409, {
        errors: { email: ['This email is already registered'] }
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await prisma.$queryRawUnsafe(
      `
      INSERT INTO leads
      (name, email, highest_qualification, interested_course_category, nationality, country_code, mobile, source, source_path, otp, otp_expire_at, status, website, created_at, updated_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0, ?, NOW(), NOW())
      `,
      name,
      email,
      highestQualification,
      interestedCourseCategory,
      nationality,
      countryCode,
      mobile,
      sourceMeta.source,
      sourceMeta.source_path,
      otp,
      website
    );

    const insertedRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM leads WHERE email = ? AND website = ? ORDER BY id DESC LIMIT 1`,
      email,
      website
    );

    const insertedId = Number(insertedRows?.[0]?.id || 0);
    if (!insertedId) {
      return apiError('Lead created but unable to resolve lead id', 500);
    }

    try {
      const counselors: any[] = await prisma.$queryRawUnsafe(
        "SELECT id FROM users WHERE (role LIKE '%counsellor%' OR role LIKE '%counselor%') AND status = 1 ORDER BY id ASC LIMIT 1"
      );
      const clrId = Number(counselors?.[0]?.id || 8);
      await prisma.$queryRawUnsafe(
        `INSERT INTO asigned_leads (clr_id, std_id, lead_type, status, created_at, updated_at) VALUES (?, ?, 'new', 1, NOW(), NOW())`,
        clrId,
        insertedId
      );
      await prisma.$queryRawUnsafe(`UPDATE leads SET asigned = 1 WHERE id = ?`, insertedId);
    } catch {
      // Keep success if lead was saved.
    }

    void sendLeadEmail({
      name,
      email,
      phone: `+${countryCode} ${mobile}`.trim(),
      nationality: nationality || null,
      university: null,
      message: interestedCourseCategory || null,
      formType: sourceMeta.source,
      sourceUrl: sourceMeta.source_path,
      extraFields: {
        ...body,
        highest_qualification: highestQualification || null,
        interested_course_category: interestedCourseCategory || null,
        country_code: countryCode || null,
      },
    }).catch((mailError) => {
      console.error('Failed to send modal form emails:', mailError);
    });

    return apiSuccess(
      { lead: serializeBigInt({ id: insertedId, email }) },
      'Application Received! We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
