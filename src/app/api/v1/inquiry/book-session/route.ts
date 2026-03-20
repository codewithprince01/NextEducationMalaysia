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
      source: 'Counseling Session Booking',
      source_path: body.source_path || '/book-session',
      dayslot: body.dayslot,
      timeslot: body.timeslot,
      time_zone: body.time_zone,
      message: body.message
    });

    return apiSuccess({ lead: serializeBigInt(lead) }, 'Counseling session booked successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to book session', 500);
  }
});
