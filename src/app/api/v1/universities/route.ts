import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, universityService } from '@/backend';

/**
 * GET /api/v1/universities
 * Returns home data for the universities section.
 */
async function getHandler(req: NextRequest) {
  try {
    const result = await universityService.getSelectUniversityData();
    return apiSuccess(result.data, 'Universities hub data fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch universities data');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
