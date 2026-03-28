import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, partnerService } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const countries = await partnerService.getCountries();
    return apiSuccess(countries, 'Success', 200, { status: true });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch countries', 500);
  }
});

