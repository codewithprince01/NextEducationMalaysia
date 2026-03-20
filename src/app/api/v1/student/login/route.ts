import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService } from '@/backend';
import { studentLoginSchema } from '@/backend/validators/auth';

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = studentLoginSchema.parse(body);

    const result = await studentAuthService.login(validatedData);

    if (!result.status) {
      return apiError(result.message, 401);
    }

    return apiSuccess(result.data, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Login failed', 500);
  }
});
