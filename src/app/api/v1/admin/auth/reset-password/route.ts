import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, issueAccessToken } from '@/backend/utils/auth';
import { apiError } from '@/backend/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const uid = Number(body.uid || body.id);
    const token = (body.token || body.remember_token || '').trim();
    const newPassword = (body.new_password || body.password || '').trim();

    if (!uid || !token || !newPassword) {
      return apiError('Missing required reset parameters.', 400);
    }

    if (newPassword.length < 8) {
      return apiError('Password must be at least 8 characters long.', 400);
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name, email, role, permissions, login_count, otp_expire_at FROM users WHERE id = ? AND remember_token = ? LIMIT 1',
      uid,
      token
    );
    const user = rows?.[0] || null;

    if (!user) {
      return apiError('Invalid or expired reset token.', 400);
    }

    if (user.otp_expire_at) {
      const nowString = new Date().toISOString().replace(/[-:TZ.]/g, '').substring(0, 14);
      if (nowString > user.otp_expire_at) {
        return apiError('Reset link has expired. Please request a new one.', 400);
      }
    }

    const hashedPassword = await hashPassword(newPassword);
    const loginCount = (Number(user.login_count) || 0) + 1;
    const now = new Date();

    await prisma.$executeRawUnsafe(
      'UPDATE users SET password = ?, remember_token = NULL, otp_expire_at = NULL, login_count = ?, last_login = ? WHERE id = ?',
      hashedPassword,
      loginCount,
      now,
      user.id
    );

    const accessToken = issueAccessToken({
      sub: Number(user.id),
      email: String(user.email || ''),
    });

    let permissions = {};
    if (typeof user.permissions === 'string') {
      try { permissions = JSON.parse(user.permissions); } catch {}
    } else if (user.permissions && typeof user.permissions === 'object') {
      permissions = user.permissions;
    }

    const userPayload = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
      last_login: now.toISOString(),
    };

    const res = NextResponse.json({
      status: true,
      message: 'Password reset successfully.',
      data: {
        token: accessToken,
        user: userPayload,
      },
    });

    res.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error('Reset password error:', error);
    return apiError(error.message || 'Failed to reset password.', 500);
  }
}
