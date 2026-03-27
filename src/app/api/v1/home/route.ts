import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, homeService } from '@/backend';

/**
 * GET /api/v1/home
 */
async function getHandler() {
  const result = await homeService.getHomeData();
  const { seo, ...data } = result;
  return apiSuccess(data, 'Home data fetched successfully', 200, { seo });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
