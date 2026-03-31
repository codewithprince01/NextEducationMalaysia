import { NextRequest } from 'next/server';
import { withMiddleware, apiSuccess, apiError, serializeBigInt, inquiryService } from '@/backend';
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
    const sourcePath = String(body.sourceUrl || body.source_path || '/').trim().slice(0, 240) || '/';

    if (!name || !email || !mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    let universityId: number | null = null;
    let universityName = String(body.university_name || body.university || '').trim();

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

    const requestForRaw = String(body.requestfor || body.formType || '').toLowerCase();
    const requestFor = requestForRaw === 'fee_structure' || requestForRaw === 'fees' || requestForRaw === 'fee'
      ? 'fees'
      : 'brochure';

    const source = requestFor === 'fees'
      ? 'Education Malaysia - Fees Request'
      : 'Education Malaysia - Brochure Request';

    const lead = await inquiryService.createLead({
      name,
      email,
      country_code: countryCode,
      mobile,
      nationality: nationality || undefined,
      highest_qualification: highestQualification || undefined,
      interested_course_category: interestedCourseCategory || undefined,
      interest: interestedCourseCategory || undefined,
      university_id: universityId ? String(universityId) : undefined,
      university: universityName || undefined,
      source: String(body.formType || source).trim(),
      source_path: sourcePath,
      brochure_status: 'requested',
      extra_fields: body,
    });

    return apiSuccess(
      {
        lead: serializeBigInt({
          ...lead,
          university_id: universityId,
          requestfor: requestFor,
          university_name: universityName || null,
        }),
      },
      'Your inquiry has been submitted successfully. We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit request', 500);
  }
});
