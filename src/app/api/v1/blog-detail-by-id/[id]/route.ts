import { NextRequest } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  apiSuccess,
  blogService,
  NotFoundError,
} from '@/backend';

/**
 * GET /api/v1/blog-detail-by-id/[id]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blogId = Number.parseInt(id, 10);
  if (!Number.isFinite(blogId) || blogId <= 0) {
    throw new NotFoundError('Blog not found');
  }

  const result = await blogService.getBlogDetailById(blogId);
  if (!result) throw new NotFoundError('Blog not found');

  return apiSuccess(result.data, 'Blog details fetched successfully', 200, {
    related_blogs: result.related_blogs,
    categories: result.categories,
    specializations: result.specializations,
    seo: result.seo,
  });
}

export const GET = withMiddleware(checkApiKey)(getHandler);

