import { NextResponse } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, studentProfileService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const appId = Number(params?.id);
    if (!appId) return apiError('Invalid application id', 400);

    const result = await studentProfileService.getApplicationRequirements(appId);
    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch application requirements', 500);
  }
});
