import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, blogService } from '@/backend';

/**
 * GET /api/v1/blog
 * Handles both general listing and search/filtering
 */
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '12');
  const category = searchParams.get('category');

  let result;
  if (category && category !== 'all') {
    result = await blogService.getBlogsByCategory(category, page, limit);
  } else {
    result = await blogService.getBlogs(page, limit);
  }

  if (!result) {
    return apiSuccess([], 'No blogs found', 200, {
      pagination: { total: 0, current_page: page, per_page: limit, last_page: 1 }
    });
  }

  return apiSuccess(result.data, 'Blogs fetched successfully', 200, { 
    pagination: result.pagination,
    seo: result.seo 
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
