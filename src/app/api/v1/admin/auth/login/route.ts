import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, issueAccessToken } from '@/backend/utils/auth';
import { apiError } from '@/backend/utils/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username || body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return apiError('Email/Username and password are required.', 400);
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      // The avatar lives in `users`.`image`; there is no profile_picture column,
      // and selecting one made every login fail with MySQL 1054.
      'SELECT id, name, email, password, role, status, permissions, login_count, image AS profile_picture FROM users WHERE email = ? LIMIT 1',
      username
    );

    const user = rows?.[0] || null;

    if (!user) {
      return apiError('Email address does not exist.', 404);
    }

    if (Number(user.status) !== 1) {
      return apiError('Your account is inactive. Please contact the administrator.', 403);
    }

    const role = (user.role || '').toLowerCase();
    const isSuperAdmin = role === 'super-admin' || role === 'admin';

    let permissions = {};
    if (typeof user.permissions === 'string') {
      try { permissions = JSON.parse(user.permissions); } catch {}
    } else if (user.permissions && typeof user.permissions === 'object') {
      permissions = user.permissions;
    }

    if (!isSuperAdmin) {
      const dashboardPerm = (permissions as any)?.dashboard?.view;
      if (!dashboardPerm && dashboardPerm !== 1 && dashboardPerm !== true) {
        return apiError('You do not have permission to log into the admin dashboard.', 403);
      }
    }

    if (!user.password) {
      return apiError('Account password is not initialized.', 400);
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return apiError('Incorrect password entered.', 401);
    }

    const loginCount = (Number(user.login_count) || 0) + 1;
    const now = new Date();

    await prisma.$executeRawUnsafe(
      'UPDATE users SET login_count = ?, last_login = ? WHERE id = ?',
      loginCount,
      now,
      user.id
    );

    const token = issueAccessToken({
      sub: Number(user.id),
      email: String(user.email || ''),
    });

    const userPayload = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
      profile_picture: user.profile_picture,
      last_login: now.toISOString(),
    };

    const res = NextResponse.json({
      status: true,
      message: 'Successfully logged in',
      data: {
        token,
        access_token: token,
        user: userPayload,
      },
    });

    res.cookies.set('admin_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return apiError(error.message || 'An error occurred during admin login.', 500);
  }
}
