import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/university-course-detail/[university_slug]/[program_slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { university_slug: string; program_slug: string } }
) {
  try {
    const result = await universityService.getUniversityCourseDetail(
      params.university_slug, 
      params.program_slug
    );
    if (!result) return apiError('University or Program not found', 404);
    return apiSuccess(result.data, 'University course details fetched successfully', 200, {
      university: result.university,
      seo: result.seo
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch university course details');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
