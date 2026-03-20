import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, statsService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const countries = await statsService.getCountries();
    return apiSuccess(serializeBigInt(countries));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch countries', 500);
  }
});
