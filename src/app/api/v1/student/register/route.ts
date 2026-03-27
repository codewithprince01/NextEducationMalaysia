import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService } from '@/backend';
import { studentRegisterSchema } from '@/backend/validators/auth';

export const POST = withMiddleware(checkApiKey)(async (request: NextRequest) => {
  try {
    // 2. Parse and validate body
    const body = await request.json();
    const validatedData = studentRegisterSchema.parse(body);

    // 3. Register student
    const result = await studentAuthService.register(validatedData);

    if (!result.status) {
      const message = result.message || 'Registration failed';
      const lower = message.toLowerCase();
      const statusCode =
        lower.includes('email') && lower.includes('already') ? 409 : 422;
      return apiError(message, statusCode);
    }

    return apiSuccess(result.data ?? null, result.message);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Registration failed', 500);
  }
});
