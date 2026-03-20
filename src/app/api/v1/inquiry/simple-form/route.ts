import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, inquiryService, serializeBigInt } from '@/backend';

export const POST = withMiddleware()(async (req: NextRequest) => {
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
      source: body.source || 'Simple Form',
      source_path: body.source_path || '',
      interested_program: body.program,
      interest: body.interest,
      message: body.message
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Inquiry submitted successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit inquiry', 500);
  }
});
