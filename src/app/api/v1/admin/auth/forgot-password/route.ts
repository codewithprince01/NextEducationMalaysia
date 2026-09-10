import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/backend/utils/response';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return apiError('Email address is required.', 400);
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name, email FROM users WHERE LOWER(email) = ? LIMIT 1',
      cleanEmail
    );
    const user = rows?.[0] || null;

    if (!user) {
      return apiError('Entered wrong email address. Please check.', 404);
    }

    const rememberToken = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    const formattedExpireAt = expireDate.toISOString().replace(/[-:TZ.]/g, '').substring(0, 14);

    await prisma.$executeRawUnsafe(
      'UPDATE users SET remember_token = ?, otp_expire_at = ? WHERE id = ?',
      rememberToken,
      formattedExpireAt,
      user.id
    );

    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/admin/password/reset?uid=${user.id}&token=${rememberToken}`;
    const magicLoginUrl = `${origin}/admin/email-login?uid=${user.id}&token=${rememberToken}`;

    return apiSuccess(
      {
        uid: Number(user.id),
        email: user.email,
        reset_url: resetUrl,
        magic_login_url: magicLoginUrl,
      },
      'Password reset instructions generated successfully.'
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return apiError(error.message || 'Failed to process forgot password request.', 500);
  }
}
