import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { personalInfoSchema } from '@/backend/validators/profile';

/**
 * GET: Fetch full student profile.
 */
export const GET = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const result = await studentProfileService.getProfile(authResult.student.sub);
    if (!result.status) return apiError(result.message, 404);
    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch profile', 500);
  }
});

/**
 * POST: Update personal info.
 */
export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validatedData = personalInfoSchema.parse(body);

    const result = await studentProfileService.updatePersonalInfo(authResult.student.sub, validatedData);
    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Failed to update profile', 500);
  }
});
