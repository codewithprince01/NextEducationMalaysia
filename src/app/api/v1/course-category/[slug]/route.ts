import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, homeService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/course-category/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const data = await homeService.getCourseCategoryDetail(params.slug);
  if (!data) throw new NotFoundError('Course category not found');
  
  return apiSuccess(data, 'Course category details fetched successfully');
}

export const GET = withMiddleware(checkApiKey)(getHandler);
