import { NextRequest } from 'next/server';
import { 
  withMiddleware, checkApiKey, apiSuccess, apiError, studentAuthService, authRateLimit, setRefreshCookie } from '@/backend';
import { studentLoginSchema } from '@/backend/validators/auth';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = studentLoginSchema.parse(body);

    const result = await studentAuthService.login(validatedData, {
      userAgent: request.headers.get('user-agent'),
      ipAddress: (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || request.headers.get('x-real-ip'),
    });

    if (!result.status) {
      return apiError(result.message, 401);
    }

    const payload = { ...(result.data as any) };
    const refreshToken = String(payload.refresh_token || '');
    delete payload.refresh_token;

    const response = apiSuccess(payload, result.message);
    if (refreshToken) {
      setRefreshCookie(response, refreshToken);
    }
    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(error.errors[0].message, 422);
    }
    return apiError(error.message || 'Login failed', 500);
  }
});
