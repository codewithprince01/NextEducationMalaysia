import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, inquiryService, serializeBigInt } from '@/backend';
import { buildLeadSource } from '@/backend/utils/lead-source';

export const POST = withMiddleware()(async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType || 'University Profile Inquiry',
      source: body.source || 'University Profile Inquiry',
      requestfor: body.requestfor || 'university-profile',
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });

    const lead = await inquiryService.createLead({
      name: body.name,
      email: body.email,
      country_code: body.country_code || '91',
      mobile: body.mobile,
      source: sourceMeta.source,
      source_path: sourceMeta.source_path,
      university_id: body.university_id,
      interested_program: body.program,
      message: body.message
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Inquiry submitted successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
