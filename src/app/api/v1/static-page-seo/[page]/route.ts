import { NextRequest } from 'next/server';
import {
  withMiddleware, checkApiKey, apiSuccess, apiError, seoService, serializeBigInt } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) => {
  try {
    const { page } = await params;
    const data = await seoService.getStaticPageSeo(page);
    return apiSuccess(serializeBigInt(data));
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch SEO data', 500);
  }
});
