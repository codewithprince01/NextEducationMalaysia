import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, scholarshipService } from '@/backend';

/**
 * GET /api/v1/scholarships/[slug]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await scholarshipService.getScholarshipDetail(params.slug);
    if (!result) return apiError('Scholarship not found', 404);
    
    return apiSuccess(result.data, 'Scholarship details fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch scholarship details');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
