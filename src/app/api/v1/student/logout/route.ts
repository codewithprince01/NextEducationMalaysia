import { NextRequest } from 'next/server';
import {
  withMiddleware,
  checkApiKey,
  authRateLimit,
  apiSuccess,
  studentAuthService,
  getRefreshTokenFromRequest,
  clearRefreshCookie,
} from '@/backend';

export const POST = withMiddleware(checkApiKey, authRateLimit)(async (request: NextRequest) => {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (refreshToken) {
    await studentAuthService.revokeRefreshToken(refreshToken);
  }

  const response = apiSuccess(null, 'Logged out successfully.');
  clearRefreshCookie(response);
  return response;
});
