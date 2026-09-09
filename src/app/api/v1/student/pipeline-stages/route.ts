import { NextResponse } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, studentProfileService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (request: Request) => {
  try {
    const result = await studentProfileService.getPipelineStages();
    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch pipeline stages', 500);
  }
});
