import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, homeService } from '@/backend';

/**
 * GET /api/v1/page-contents/[page]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const contents = await homeService.getPageContents(page);
    return apiSuccess(contents, 'Page contents fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch page contents');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
