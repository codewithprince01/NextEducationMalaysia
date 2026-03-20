import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, blogService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/blog-details/[category]/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { category: string, slug: string } }
) {
  const result = await blogService.getBlogDetail(params.category, params.slug);
  if (!result) throw new NotFoundError('Blog not found');
  
  return apiSuccess(result.data, 'Blog details fetched successfully', 200, {
    related_blogs: result.related_blogs,
    categories: result.categories,
    specializations: result.specializations,
    seo: result.seo
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);
