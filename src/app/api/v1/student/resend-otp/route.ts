import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService } from '@/backend';

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  try {
    const { id, email } = await request.json();
    if (!id && !email) return apiError('id or email is required', 422);

    const result = await studentAuthService.resendOtp(id ? Number(id) : email);

    if (!result.status) {
      return apiError(result.message, 400);
    }

    return apiSuccess(result.data ?? null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to resend OTP', 500);
  }
});
