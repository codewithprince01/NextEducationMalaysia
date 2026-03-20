import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService } from '@/backend';

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  try {
    const { email } = await request.json();
    if (!email) return apiError('Email is required', 422);

    const result = await studentAuthService.resendOtp(email);

    if (!result.status) {
      return apiError(result.message, 400);
    }

    return apiSuccess(null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to resend OTP', 500);
  }
});
