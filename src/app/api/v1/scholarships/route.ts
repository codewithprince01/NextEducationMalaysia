import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, scholarshipService } from '@/backend';

/**
 * GET /api/v1/scholarships
 */
async function getHandler(req: NextRequest) {
  try {
    const result = await scholarshipService.getScholarships();
    return apiSuccess(result.data, 'Scholarships fetched successfully', 200, { seo: result.seo });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch scholarships');
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
