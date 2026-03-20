import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService } from '@/backend';
import { otpVerifySchema } from '@/backend/validators/auth';

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = otpVerifySchema.parse(body);

    const result = await studentAuthService.verifyOtp(validatedData);

    if (!result.status) {
      return apiError(result.message, 400);
    }

    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Verification failed', 500);
  }
});
