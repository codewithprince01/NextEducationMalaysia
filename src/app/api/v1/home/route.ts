import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, homeService } from '@/backend';

/**
 * GET /api/v1/home
 */
async function getHandler() {
  const result = await homeService.getHomeData();
  return apiSuccess(result.data, 'Home data fetched successfully', 200, { seo: result.seo });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
