import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/university-courses/[university_slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { university_slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const filterParams = {
      level: searchParams.get('level') || undefined,
      course_category_id: searchParams.get('course_category_id') || undefined,
      specialization_id: searchParams.get('specialization_id') || undefined,
      study_mode: searchParams.get('study_mode') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
    };

    const result = await universityService.getUniversityCourses(params.university_slug, filterParams);
    if (!result) return apiError('University not found', 404);
    return apiSuccess(result.data, 'University courses fetched successfully', 200, {
      pagination: result.pagination
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch university courses');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
