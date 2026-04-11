import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService, authRateLimit } from '@/backend';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  try {
    const { email } = await request.json();
    if (!email) return apiError('Email is required', 422);
    const originFromHeader =
      request.headers.get('origin') ||
      `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'}`;

    const result = await studentAuthService.forgotPassword(email, originFromHeader);

    if (!result.status) {
      const message = result.message || 'Failed to send reset email';
      const statusCode = message.toLowerCase().includes('wrong email') ? 404 : 400;
      return apiError(message, statusCode);
    }

    return apiSuccess(result.data ?? null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to send reset code', 500);
  }
});
