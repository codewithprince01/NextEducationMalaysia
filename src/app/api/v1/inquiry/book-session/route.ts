import { NextRequest } from 'next/server';
import { withMiddleware, apiSuccess, apiError, serializeBigInt, inquiryService } from '@/backend';
import { buildLeadSource } from '@/backend/utils/lead-source';

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
    const dayslot = String(body.dayslot || '').trim().slice(0, 50);
    const timeslot = String(body.timeslot || body.preferred_time || '').trim().slice(0, 50);
    const timeZone = String(body.time_zone || '').trim().slice(0, 100);
    const message = String(body.message || '').trim();

    if (!name || !email || !mobile || !nationality || !highestQualification || !interestedCourseCategory) {
      return apiError('Name, email, mobile, nationality, highest qualification and interested course category are required', 400);
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType,
      source: 'Counselling Request',
      requestfor: 'counselling',
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });

    const lead = await inquiryService.createLead({
      name,
      email,
      country_code: countryCode,
      mobile,
      nationality,
      highest_qualification: highestQualification,
      interested_course_category: interestedCourseCategory,
      interest: interestedCourseCategory,
      source: sourceMeta.source,
      source_path: sourceMeta.source_path,
      dayslot: dayslot || undefined,
      timeslot: timeslot || undefined,
      time_zone: timeZone || undefined,
      message: message || undefined,
      university_id: body.university_id ? String(body.university_id) : undefined,
      university: body.university_name ? String(body.university_name) : undefined,
      brochure_status: 'requested',
      extra_fields: body,
    });

    return apiSuccess(
      { lead: serializeBigInt(lead) },
      'Your inquiry has been submitted successfully. We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to book session', 500);
  }
});
