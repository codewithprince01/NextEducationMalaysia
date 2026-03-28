import { NextRequest } from 'next/server';
import { 
  withMiddleware, apiSuccess, apiError, serializeBigInt } from '@/backend';
import { prisma } from '@/lib/db-fresh';

export const POST = withMiddleware()(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({} as any));
  try {
    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 190);
    const mobile = String(body.mobile || '').trim().slice(0, 20);
    const countryCode = String(body.country_code || '91').replace('+', '').trim().slice(0, 8) || '91';
    const nationality = String(body.nationality || '').trim().slice(0, 100);
    const highestQualification = String(body.highest_qualification || '').trim().slice(0, 120);
    const interestedCourseCategory = String(body.interested_course_category || '').trim().slice(0, 120);
    const sourcePath = String(body.source_path || '/').trim().slice(0, 240) || '/';

    if (!name || !email || !mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    let universityId: number | null = null;
    let universityName = String(body.university_name || '').trim();

    const parsedId = Number(body.university_id);
    if (Number.isFinite(parsedId) && parsedId > 0) {
      const uniById: any[] = await prisma.$queryRawUnsafe(
        'SELECT id, name FROM universities WHERE id = ? LIMIT 1',
        parsedId
      );
      if (uniById.length) {
        universityId = Number(uniById[0].id);
        universityName = String(uniById[0].name || universityName);
      }
    }

    if (!universityId && universityName) {
      const uniByName: any[] = await prisma.$queryRawUnsafe(
        'SELECT id, name FROM universities WHERE name = ? LIMIT 1',
        universityName
      );
      if (uniByName.length) {
        universityId = Number(uniByName[0].id);
        universityName = String(uniByName[0].name || universityName);
      }
    }

    if (!universityName) {
      universityName = 'Education Malaysia University';
    }

    const requestForRaw = String(body.requestfor || '').toLowerCase();
    const requestFor = requestForRaw === 'fee_structure' ? 'fees' : requestForRaw || 'brochure';
    const source =
      requestFor === 'fees'
        ? 'Education Malaysia - Fees Request'
        : 'Education Malaysia - Brochure Request';

    await prisma.$queryRawUnsafe(
      `
      INSERT INTO leads
      (name, c_code, country_code, mobile, email, nationality, highest_qualification, interested_course_category, intrested_university, university_id, source, source_path, website, brochure_status, status, created_at, updated_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', 1, NOW(), NOW())
      `,
      name,
      countryCode,
      countryCode,
      mobile,
      email,
      nationality,
      highestQualification,
      interestedCourseCategory,
      universityName,
      universityId,
      source,
      sourcePath,
      process.env.SITE_VAR || 'MYS'
    );

    // Prisma raw insert doesn't reliably expose insertId; fetch latest matching lead.
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
      process.env.SITE_VAR || 'MYS'
    );
    const insertedId = Number(insertedRows?.[0]?.id || 0);
    if (!insertedId) {
      return apiError('Lead created but unable to resolve lead id', 500);
    }

    // Non-blocking assignment (old project behavior: lead save is primary)
    try {
      const counselors: any[] = await prisma.$queryRawUnsafe(
        "SELECT id FROM users WHERE (role LIKE '%counsellor%' OR role LIKE '%counselor%') AND status = 1 ORDER BY id ASC LIMIT 1"
      );
      const clrId = Number(counselors[0]?.id || 8);
      await prisma.$queryRawUnsafe(
        `INSERT INTO asigned_leads (clr_id, std_id, lead_type, status, created_at, updated_at) VALUES (?, ?, 'new', 1, NOW(), NOW())`,
        clrId,
        insertedId
      );
      await prisma.$queryRawUnsafe(`UPDATE leads SET asigned = 1 WHERE id = ?`, insertedId);
    } catch (assignError: any) {
      // Keep lead saved, but surface assignment issue for easier debugging/visibility.
      return apiError(`Lead saved (id ${insertedId}) but assignment failed: ${assignError?.message || 'Unknown error'}`, 500);
    }

    return apiSuccess(
      { lead: serializeBigInt({ id: insertedId, university_id: universityId, requestfor: requestFor, university_name: universityName }) },
      'Your inquiry has been submitted successfully. We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit request', 500);
  }
});
