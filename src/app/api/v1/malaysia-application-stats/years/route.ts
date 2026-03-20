import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, malaysiaStatsService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const years = await malaysiaStatsService.getYears();
    return apiSuccess(years);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch years', 500);
  }
});
