import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { gmatSchema } from '@/backend/validators/profile';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validatedData = gmatSchema.parse(body);

    const result = await studentProfileService.updateGMAT(authResult.student.sub, validatedData);
    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Failed to update GMAT score', 500);
  }
});
