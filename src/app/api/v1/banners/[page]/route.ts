import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, homeService } from '@/backend';

/**
 * GET /api/v1/banners/[page]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { page: string } }
) {
  const banners = await homeService.getBanners(params.page);
  return apiSuccess({ banners }, 'Banners fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
