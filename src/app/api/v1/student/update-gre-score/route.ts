import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { greSchema } from '@/backend/validators/profile';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validatedData = greSchema.parse(body);

    const result = await studentProfileService.updateGRE(authResult.student.sub, validatedData);
    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const first = error?.errors?.[0]?.message || error?.issues?.[0]?.message || 'Invalid request';
      return apiError(first, 422);
    }
    return apiError(error.message || 'Failed to update GRE score', 500);
  }
});
