import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, inquiryService, serializeBigInt } from '@/backend';
import { buildLeadSource } from '@/backend/utils/lead-source';

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    if (!body.name || !body.email || !body.mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType || 'Exam Inquiry',
      source: body.source || 'Exam Inquiry',
      requestfor: body.requestfor || 'exam',
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
      interested_program: body.exam_name || body.program,
      message: body.message
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Examination inquiry submitted successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
