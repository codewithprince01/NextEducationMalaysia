import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';

export const DELETE = withMiddleware(checkApiKey)(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const schoolId = parseInt(params.id);
    if (isNaN(schoolId)) return apiError('Invalid school ID', 400);

    const result = await studentProfileService.deleteSchool(authResult.student.sub, schoolId);
    if (!result.status) return apiError(result.message, 404);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete school', 500);
  }
});
