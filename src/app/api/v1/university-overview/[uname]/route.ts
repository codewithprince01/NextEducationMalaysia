import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/university-overview/[uname]
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { uname: string } }
) {
  try {
    const result = await universityService.getUniversityOverview(params.uname);
    if (!result) return apiError('University not found', 404);
    return apiSuccess(result.data, 'University overview fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch university overview');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
