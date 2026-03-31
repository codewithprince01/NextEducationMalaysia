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
      source: body.formType || 'Contact Us',
      source_path: body.sourceUrl || body.source_path || '/contact-us',
      nationality: body.nationality || undefined,
      message: body.message,
      extra_fields: body,
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Contact request submitted successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to submit request', 500);
  }
});
