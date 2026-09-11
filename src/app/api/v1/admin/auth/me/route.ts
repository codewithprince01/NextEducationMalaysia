import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/backend/utils/auth';
import { apiSuccess, apiError } from '@/backend/utils/response';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('admin_access_token')?.value;

    let token = cookieToken;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return apiError('Unauthenticated.', 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return apiError('Token is invalid or expired.', 401);
    }

    const userId = Number(payload.sub);
    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name, email, role, status, permissions, profile_picture, department, last_login, created_at FROM users WHERE id = ? LIMIT 1',
      userId
    );

    const user = rows?.[0] || null;

    if (!user || Number(user.status) !== 1) {
      return apiError('User not found or account disabled.', 401);
    }

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
      status: Number(user.status),
      permissions,
      profile_picture: user.profile_picture,
      department: user.department,
      last_login: user.last_login,
      created_at: user.created_at,
    };

    return apiSuccess({ user: userPayload }, 'Admin profile fetched successfully.');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch admin profile.', 500);
  }
}
