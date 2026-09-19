import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService, authRateLimit } from '@/backend';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, email } = body;
    if (!id && !email) return apiError('id or email is required', 422);

    const hasNumericId = id !== undefined && id !== null && id !== '' && !isNaN(Number(id)) && Number(id) > 0;
    const identifier = hasNumericId ? Number(id) : (email ? String(email).trim() : String(id).trim());
    const fallbackEmail = email && String(email).trim() ? String(email).trim() : undefined;

    const result = await studentAuthService.resendOtp(identifier, fallbackEmail);

    if (!result.status) {
      return apiError(result.message, 400);
    }

    return apiSuccess(result.data ?? null, result.message);
  } catch (error: any) {
    return apiError(error.message || 'Failed to resend OTP', 500);
  }
});
