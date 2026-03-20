import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware, checkApiKey, requireAuth, apiSuccess, apiError, applicationService, serializeBigInt } from '@/backend';

export const POST = withMiddleware(checkApiKey)(async (
  request: NextRequest,
  { params }: { params: Promise<{ program_id: string }> }
) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { program_id } = await params;
    const application = await applicationService.applyProgram(BigInt(authResult.student.sub), program_id);

    return apiSuccess(
      { application: serializeBigInt(application) },
      'Program applied successfully. Please complete your profile.',
      201
    );
  } catch (error: any) {
    if (error.message === 'ALREADY_APPLIED') {
      return apiError('You have already applied for this program.', 409);
    }
    return apiError(error.message || 'Failed to apply for program', 500);
  }
});
