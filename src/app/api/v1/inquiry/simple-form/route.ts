import { NextRequest } from 'next/server';
import { withMiddleware, apiSuccess, apiError, serializeBigInt, inquiryService } from '@/backend';

export const POST = withMiddleware()(async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({} as any));

    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 190);
    const mobile = String(body.mobile || '').trim().slice(0, 20);
    const countryCode = String(body.country_code || '91').replace('+', '').trim().slice(0, 8) || '91';
    const source = String(body.formType || body.source || 'Education Malaysia - General Inquiry').trim().slice(0, 180);
    const sourcePath = String(body.sourceUrl || body.source_path || '/').trim().slice(0, 240) || '/';
    const nationality = String(body.nationality || '').trim().slice(0, 100);
    const interestedProgram = String(body.interested_program || body.program || '').trim().slice(0, 160);
    const interestedCourseCategory = String(body.interested_course_category || body.interest || '').trim().slice(0, 160);
    const message = String(body.message || '').trim();

    if (!name || !email || !mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    const lead = await inquiryService.createLead({
      name,
      email,
      country_code: countryCode,
      mobile,
      source,
      source_path: sourcePath,
      nationality: nationality || undefined,
      interested_program: interestedProgram || undefined,
      interested_course_category: interestedCourseCategory || undefined,
      interest: interestedCourseCategory || undefined,
      message: message || undefined,
      extra_fields: body,
    });

    return apiSuccess(
      { lead: serializeBigInt(lead) },
      'Your inquiry has been submitted successfully. We will contact you soon.',
      200
    );
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
