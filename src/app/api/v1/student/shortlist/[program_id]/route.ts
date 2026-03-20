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
    const application = await applicationService.shortlistProgram(BigInt(authResult.student.sub), program_id);

    return apiSuccess(
      { application: serializeBigInt(application) },
      'Program shortlisted successfully.',
      201
    );
  } catch (error: any) {
    if (error.message === 'ALREADY_SHORTLISTED_OR_APPLIED') {
      return apiError('Program already shortlisted or applied.', 409);
    }
    return apiError(error.message || 'Failed to shortlist program', 500);
  }
});
