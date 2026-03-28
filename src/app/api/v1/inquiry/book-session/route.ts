import { NextRequest } from 'next/server';
import { 
  withMiddleware, apiSuccess, apiError, serializeBigInt } from '@/backend';
import { prisma } from '@/lib/db-fresh';

export const POST = withMiddleware()(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({} as any));
    
    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 190);
    const mobile = String(body.mobile || '').trim().slice(0, 20);
    const countryCode = String(body.country_code || '91').replace('+', '').trim().slice(0, 8) || '91';
    const nationality = String(body.nationality || '').trim().slice(0, 100);
    const highestQualification = String(body.highest_qualification || '').trim().slice(0, 120);
    const interestedCourseCategory = String(body.interested_course_category || '').trim().slice(0, 120);
    const sourcePath = String(body.source_path || '/').trim().slice(0, 240) || '/';
    const dayslot = String(body.dayslot || '').trim().slice(0, 50);
    const timeslot = String(body.timeslot || body.preferred_time || '').trim().slice(0, 50);
    const timeZone = String(body.time_zone || '').trim().slice(0, 100);
    const message = String(body.message || '').trim();

    if (!name || !email || !mobile || !nationality || !highestQualification || !interestedCourseCategory) {
      return apiError('Name, email, mobile, nationality, highest qualification and interested course category are required', 400);
    }

    const source = 'Education Malaysia - Book Session';
    const website = process.env.SITE_VAR || 'MYS';

    await prisma.$queryRawUnsafe(
      `
      INSERT INTO leads
      (name, country_code, mobile, email, nationality, highest_qualification, interested_course_category, source, source_path, dayslot, timeslot, time_zone, message, website, status, created_at, updated_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
      name,
      countryCode,
      mobile,
      email,
      nationality,
      highestQualification,
      interestedCourseCategory,
      source,
      sourcePath,
      dayslot || null,
      timeslot || null,
      timeZone || null,
      message || null,
      website
    );

    const insertedRows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT id
      FROM leads
      WHERE email = ? AND mobile = ? AND source = ? AND website = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      email,
      mobile,
      source,
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
      // Keep response successful if lead is already saved.
      // Old project also treats assignment as a best-effort background step.
    }

    return apiSuccess(
      { lead: serializeBigInt({ id: insertedId }) },
      'Your inquiry has been submitted successfully. We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to book session', 500);
  }
});
