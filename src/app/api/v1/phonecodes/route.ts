import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, countryService, serializeBigInt } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const data = await countryService.getPhoneCodes();
    return apiSuccess(serializeBigInt(data));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch phonecodes', 500);
  }
});
