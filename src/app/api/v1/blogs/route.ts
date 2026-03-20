import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, blogService } from '@/backend';

/**
 * GET /api/v1/blogs
 */
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const result = await blogService.getBlogs(page, limit);
  return apiSuccess(result.data, 'Blogs fetched successfully', 200, { 
    pagination: result.pagination,
    seo: result.seo 
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
