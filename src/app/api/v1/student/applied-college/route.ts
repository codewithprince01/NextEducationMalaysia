import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const result = await studentProfileService.getAppliedPrograms(authResult.student.sub);
    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch applied programs', 500);
  }
});
