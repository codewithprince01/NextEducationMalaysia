import { NextRequest } from 'next/server';
import { 
  withMiddleware, 
  checkApiKey, 
  apiSuccess, 
  apiError, 
  malaysiaDiscoveryService 
} from '@/backend';

/**
 * GET /api/v1/courses/filters
 * Returns filter options for courses in Malaysia.
 */
async function getHandler(req: NextRequest) {
  try {
    // We can reuse getCoursesInMalaysia with minimal limit to get the filters
    const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
      page: 1
    });

    // The frontend expects the filters directly in the data property or at the root
    return apiSuccess(result.filters, 'Course filters fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch course filters', 500);
  }
}

export const GET = withMiddleware(checkApiKey)(getHandler);
