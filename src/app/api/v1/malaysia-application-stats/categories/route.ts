import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, malaysiaStatsService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const categories = await malaysiaStatsService.getCategories();
    return apiSuccess(serializeBigInt(categories));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch categories', 500);
  }
});
