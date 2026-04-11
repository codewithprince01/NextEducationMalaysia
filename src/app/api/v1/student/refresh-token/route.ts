import { NextRequest } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  authRateLimit,
  apiSuccess,
  apiError,
  studentAuthService,
  getRefreshTokenFromRequest,
  setRefreshCookie,
  clearRefreshCookie,
} from '@/backend';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      return apiError('Refresh token missing.', 401);
    }

    const result = await studentAuthService.refreshAccessToken(refreshToken, {
      userAgent: request.headers.get('user-agent'),
      ipAddress: (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || request.headers.get('x-real-ip'),
    });

    if (!result.status) {
      const fail = apiError(result.message || 'Invalid refresh token.', 401);
      clearRefreshCookie(fail);
      return fail;
    }

    const payload = { ...(result.data as any) };
    const nextRefreshToken = String(payload.refresh_token || '');
    delete payload.refresh_token;

    const response = apiSuccess(payload, result.message || 'Token refreshed successfully.');
    if (nextRefreshToken) {
      setRefreshCookie(response, nextRefreshToken);
    }
    return response;
  } catch (error: any) {
    const fail = apiError(error.message || 'Failed to refresh token', 500);
    clearRefreshCookie(fail);
    return fail;
  }
});
