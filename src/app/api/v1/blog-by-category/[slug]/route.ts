import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, blogService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/blog-by-category/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '12');

  const result = await blogService.getBlogsByCategory(params.slug, page, limit);
  if (!result) throw new NotFoundError('Blog category not found');
  
  return apiSuccess(result.data, 'Blogs by category fetched successfully', 200, {
    category: result.category,
    pagination: result.pagination,
    seo: result.seo
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
