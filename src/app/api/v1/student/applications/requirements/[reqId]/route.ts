import { NextResponse } from 'next/server';
import { withMiddleware, checkApiKey, apiSuccess, apiError, studentProfileService } from '@/backend';

export const PATCH = withMiddleware(checkApiKey)(async (
  request: Request,
  context: { params: Promise<{ reqId: string }> | { reqId: string } }
) => {
  try {
    const params = await Promise.resolve(context?.params);
    const reqId = Number(params?.reqId);
    if (!reqId) return apiError('Invalid requirement id', 400);

    const body = await request.json();
    const result = await studentProfileService.updateRequirementStatus(reqId, body.doc_status || 'Reviewing');
    return apiSuccess(result, 'Requirement status updated');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update requirement status', 500);
  }
});
