import { NextRequest } from 'next/server';
import {
  withMiddleware, apiSuccess, apiError, dropdownService, serializeBigInt } from '@/backend';

export const GET = withMiddleware()(async (req: NextRequest) => {
  try {
    const data = await dropdownService.getLevels();
    return apiSuccess(serializeBigInt(data));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch levels', 500);
  }
});
