import { NextResponse } from 'next/server';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import type { JwtPayload, Student } from '../types';

// ============================================================
// AUTH MIDDLEWARE
// Validates Bearer JWT token — replaces Laravel `auth:sanctum`.
// Students are stored in `leads` table, not `users`.
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

/**
 * Verifies the Authorization: Bearer <token> header.
 * Returns the decoded student payload if valid, or a 401 response.
 *
 * Usage in a protected route:
 *   const result = await requireAuth(request);
 *   if (result instanceof NextResponse) return result;
 *   const { student } = result;
 */
export async function requireAuth(
  request: Request
): Promise<{ student: JwtPayload } | NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { status: false, message: 'Unauthenticated. Token missing.' },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    return { student: payload };
  } catch (err) {
    const isExpired = err instanceof TokenExpiredError;
    return NextResponse.json(
      {
        status: false,
        message: isExpired
          ? 'Token has expired. Please log in again.'
          : 'Invalid token. Please log in again.',
      },
      { status: 401 }
    );
  }
}

/**
 * Issues a signed JWT for a student (Lead).
 * Mirrors Laravel `$student->createToken('StudentAPIToken')->plainTextToken`.
 */
export function issueToken(student: Pick<Student, 'id' | 'email'>): string {
  return jwt.sign(
    { sub: Number(student.id), email: student.email ?? '' } satisfies JwtPayload,
    JWT_SECRET,
    { expiresIn: 60 * 60 * 24 * 7 } // 7 days
  );
}
