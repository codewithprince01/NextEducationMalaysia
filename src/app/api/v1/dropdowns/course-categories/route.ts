import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, dropdownService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const data = await dropdownService.getCourseCategories();
    return apiSuccess(serializeBigInt(data));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch course categories', 500);
  }
});
