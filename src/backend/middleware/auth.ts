import { NextResponse } from 'next/server';
import type { JwtPayload, Student } from '../types';
import { issueAccessToken, verifyAccessToken, verifyRefreshToken, sha256 } from '../utils/auth';
import { prisma } from '@/lib/db';

// ============================================================
// AUTH MIDDLEWARE
// Validates Bearer JWT token and falls back to secure refresh cookie session.
// Students are stored in `leads` table, not `users`.
// ============================================================

const AUTH_REFRESH_COOKIE_NAME = process.env.JWT_REFRESH_COOKIE_NAME || 'em_refresh_token';

function parseCookies(request: Request): Record<string, string> {
  const raw = request.headers.get('cookie') || '';
  if (!raw) return {};

  return raw.split(';').reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx <= 0) return acc;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

async function authenticateViaRefreshCookie(request: Request): Promise<JwtPayload | null> {
  try {
    const cookies = parseCookies(request);
    const refreshToken = cookies[AUTH_REFRESH_COOKIE_NAME];
    if (!refreshToken) return null;

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);

    const rows = await prisma.$queryRawUnsafe<Array<{
      student_id: bigint | number;
      revoked_at: Date | null;
      expires_at: Date | string;
    }>>(
      `SELECT student_id, revoked_at, expires_at
       FROM student_refresh_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      tokenHash
    );

    const tokenRow = rows[0];
    if (!tokenRow) return null;
    if (tokenRow.revoked_at) return null;

    const expiresAt = new Date(tokenRow.expires_at);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) return null;

    const studentId = Number(tokenRow.student_id);
    if (!studentId || Number(payload.sub) !== studentId) return null;

    return { sub: studentId, email: String(payload.email || '') };
  } catch {
    return null;
  }
}

/**
 * Verifies Authorization: Bearer <access_token>.
 * If access token is missing/expired, attempts refresh-cookie fallback.
 */
export async function requireAuth(
  request: Request
): Promise<{ student: JwtPayload } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      return { student: payload };
    } catch {
      // access token invalid/expired -> refresh-cookie fallback below
    }
  }

  const fallbackStudent = await authenticateViaRefreshCookie(request);
  if (fallbackStudent) {
    return { student: fallbackStudent };
  }

  return NextResponse.json(
    { status: false, message: 'Unauthenticated. Please log in again.' },
    { status: 401 }
  );
}

/**
 * Backward-compatible token issuer used by existing flows.
 * Returns short-lived access token (TTL configurable via env).
 */
export function issueToken(student: Pick<Student, 'id' | 'email'>): string {
  return issueAccessToken({ sub: Number(student.id), email: student.email ?? '' });
}
