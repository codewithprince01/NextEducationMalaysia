import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/university-details/[uname]
 * Returns full details for a single university.
 */
async function getHandler(
  req: NextRequest,
  { params }: { params: { uname: string } }
) {
  try {
    const uname = params.uname;
    const result = await universityService.getUniversityDetail(uname);
    
    if (!result) {
      return apiError('University not found', 404);
    }

    return apiSuccess(result.data, 'University details fetched successfully', 200, {
      faculties: result.faculties,
      seo: result.seo
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch university details');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
