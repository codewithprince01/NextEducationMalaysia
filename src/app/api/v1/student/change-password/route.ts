import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { changePasswordSchema } from '@/backend/validators/profile';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      const { searchParams } = new URL(request.url);
      body = {
        old_password: searchParams.get('old_password') || '',
        new_password: searchParams.get('new_password') || '',
        confirm_new_password: searchParams.get('confirm_new_password') || '',
      };
    }
    const validatedData = changePasswordSchema.parse(body);

    const result = await studentProfileService.changePassword(authResult.student.sub, validatedData);
    if (!result.status) {
      const statusCode =
        result.message === 'Student not found.'
          ? 404
          : result.message === 'The old password is incorrect.'
            ? 401
            : 400;
      return apiError(result.message, statusCode);
    }

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const first = error?.errors?.[0]?.message || error?.issues?.[0]?.message || 'Invalid request';
      return apiError(first, 422);
    }
    return apiError(error.message || 'Failed to change password', 500);
  }
});
