import { NextRequest } from 'next/server';
import { 
  withMiddleware, apiSuccess, homeService, NotFoundError } from '@/backend';

/**
 * GET /api/v1/course-category/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await homeService.getCourseCategoryDetail(slug);
  if (!data) throw new NotFoundError('Course category not found');
  
  return apiSuccess(data, 'Course category details fetched successfully');
}

export const GET = withMiddleware()(getHandler);
