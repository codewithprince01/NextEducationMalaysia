import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, applicationService } from '@/backend';

export const DELETE = withMiddleware(checkApiKey)(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    await applicationService.deleteApplication(id);

    return apiSuccess(null, 'Program application deleted successfully.');
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return apiError('Program application not found.', 404);
    }
    return apiError(error.message || 'Failed to delete application', 500);
  }
});
