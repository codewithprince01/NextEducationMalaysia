import { NextRequest } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, discoveryService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (req: NextRequest) => {
  try {
    const result = await discoveryService.getCourseCategories();
    return apiSuccess(result.data, 'Course categories fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch course categories', 500);
  }
});
