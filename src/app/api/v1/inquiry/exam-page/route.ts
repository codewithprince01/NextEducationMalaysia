import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, inquiryService, serializeBigInt } from '@/backend';

export const POST = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    if (!body.name || !body.email || !body.mobile) {
      return apiError('Name, email and mobile are required', 400);
    }

    const lead = await inquiryService.createLead({
      name: body.name,
      email: body.email,
      country_code: body.country_code || '91',
      mobile: body.mobile,
      source: 'Exam Page Inquiry',
      source_path: body.source_path || '',
      interested_program: body.exam_name || body.program,
      message: body.message
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Examination inquiry submitted successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
