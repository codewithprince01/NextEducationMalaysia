import type { NextResponse } from 'next/server';

export const REFRESH_COOKIE_NAME = process.env.JWT_REFRESH_COOKIE_NAME || 'em_refresh_token';

export function refreshCookieMaxAgeSeconds(): number {
  const days = Number.parseInt(String(process.env.JWT_REFRESH_COOKIE_DAYS || '30'), 10);
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 60) : 30;
  return safeDays * 24 * 60 * 60;
}

export function setRefreshCookie(response: NextResponse, token: string): void {
  response.cookies.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: refreshCookieMaxAgeSeconds(),
  });
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  const raw = request.headers.get('cookie') || '';
  if (!raw) return null;
  const parts = raw.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    if (key !== REFRESH_COOKIE_NAME) continue;
    return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}
