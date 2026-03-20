import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, homeService } from '@/backend';

/**
 * GET /api/v1/courses/[level]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const data = await homeService.getCoursesByLevel(params.level);
    if (!data) return apiError('Page not found', 404);
    return apiSuccess(data, 'Courses by level fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch courses by level');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
