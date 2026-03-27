import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, studentProfileService } from '@/backend';
import { backgroundInfoSchema } from '@/backend/validators/profile';

export const POST = withMiddleware(checkApiKey)(async (request: Request) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    let body: any = {};
    const url = new URL(request.url);
    const qRefused = url.searchParams.get('refused_visa');
    const qPermit = url.searchParams.get('valid_study_permit');
    const qNote = url.searchParams.get('visa_note');

    if (qRefused || qPermit || qNote) {
      body = {
        refused_visa: qRefused,
        valid_study_permit: qPermit,
        visa_note: qNote ?? '',
      };
    } else {
      body = await request.json();
    }
    const validatedData = backgroundInfoSchema.parse(body);

    const result = await studentProfileService.updateBackgroundInfo(authResult.student.sub, validatedData);
    if (!result.status) return apiError(result.message, 400);

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const first = error?.errors?.[0]?.message || error?.issues?.[0]?.message || 'Invalid request';
      return apiError(first, 422);
    }
    return apiError(error.message || 'Failed to update background info', 500);
  }
});
