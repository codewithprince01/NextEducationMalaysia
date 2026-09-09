import { NextRequest, NextResponse } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  requireAuth,
  apiSuccess,
  apiError,
  studentProfileService,
} from '@/backend';

export const GET = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const studentId = Number(authResult.student.sub);
    const result = await studentProfileService.getConversation(studentId);
    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch conversation', 500);
  }
});

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const studentId = Number(authResult.student.sub);
    const body = await request.json();
    const result = await studentProfileService.sendChatMessage(studentId, body.message || '');
    if (!result.status) {
      return apiError(result.message, 400);
    }
    return apiSuccess(null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to send message', 500);
  }
});
