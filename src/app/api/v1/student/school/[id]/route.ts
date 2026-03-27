import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  requireAuth,
  apiSuccess,
  apiError,
  studentProfileService,
} from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const schoolId = parseInt(id, 10);
    if (Number.isNaN(schoolId)) return apiError('Invalid school ID', 400);

    const result = await studentProfileService.getSchool(authResult.student.sub, schoolId);
    if (!result.status) return apiError(result.message, 404);

    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch school', 500);
  }
});
