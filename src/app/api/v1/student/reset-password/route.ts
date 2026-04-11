import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService, authRateLimit } from '@/backend';
import { resetPasswordSchema } from '@/backend/validators/auth';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    const result = await studentAuthService.resetPassword(validatedData);

    if (!result.status) {
      const message = String(result.message || 'Failed to reset password');
      if (message.toLowerCase().includes('expired')) {
        return apiError(message, 410);
      }
      if (message.toLowerCase().includes('invalid password reset link')) {
        return apiError(message, 404);
      }
      return apiError(message, 400);
    }

    return apiSuccess(null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const first = error?.errors?.[0]?.message || error?.issues?.[0]?.message || 'Invalid request';
      return apiError(first, 422);
    }
    return apiError(error.message || 'Failed to reset password', 500);
  }
});
