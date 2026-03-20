import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, blogService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/blogs/[categorySlug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { categorySlug: string } }
) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const result = await blogService.getBlogsByCategory(params.categorySlug, page, limit);
  if (!result) throw new NotFoundError('Blog category not found');
  
  return apiSuccess(result.data, 'Blogs by category fetched successfully', 200, {
    category: result.category,
    pagination: result.pagination,
    seo: result.seo
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
