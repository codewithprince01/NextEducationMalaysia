import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken } from '@/backend/utils/auth';
import { apiSuccess, apiError } from '@/backend/utils/response';
import bcrypt from 'bcryptjs';

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
      // See the login route: the avatar column is `image`, not profile_picture.
      'SELECT id, name, email, role, status, permissions, image AS profile_picture, department, last_login, created_at FROM users WHERE id = ? LIMIT 1',
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

export async function PUT(req: NextRequest) {
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
    const body = await req.json();
    const { name, email, department, password, current_password } = body;

    if (!name || !email) {
      return apiError('Name and email are required.', 400);
    }

    // If password change is requested, verify current password
    if (password && password.trim() !== '') {
      if (!current_password) {
        return apiError('Current password is required to set a new password.', 400);
      }
      const existing: any[] = await prisma.$queryRawUnsafe(
        'SELECT password FROM users WHERE id = ? LIMIT 1',
        userId
      );
      if (!existing || existing.length === 0) {
        return apiError('User not found.', 404);
      }
      const isMatch = await bcrypt.compare(current_password, existing[0].password || '');
      if (!isMatch) {
        return apiError('Current password does not match.', 400);
      }

      const hashedNew = await bcrypt.hash(password, 10);
      await prisma.$executeRawUnsafe(
        'UPDATE users SET name = ?, email = ?, department = ?, password = ?, updated_at = ? WHERE id = ?',
        name,
        email,
        department || null,
        hashedNew,
        new Date(),
        userId
      );
    } else {
      await prisma.$executeRawUnsafe(
        'UPDATE users SET name = ?, email = ?, department = ?, updated_at = ? WHERE id = ?',
        name,
        email,
        department || null,
        new Date(),
        userId
      );
    }

    // Fetch updated user
    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, name, email, role, status, permissions, image AS profile_picture, department, last_login, created_at FROM users WHERE id = ? LIMIT 1',
      userId
    );

    const updatedUser = rows?.[0];
    let permissions = {};
    if (typeof updatedUser.permissions === 'string') {
      try { permissions = JSON.parse(updatedUser.permissions); } catch {}
    } else if (updatedUser.permissions && typeof updatedUser.permissions === 'object') {
      permissions = updatedUser.permissions;
    }

    const userPayload = {
      id: Number(updatedUser.id),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: Number(updatedUser.status),
      permissions,
      profile_picture: updatedUser.profile_picture,
      department: updatedUser.department,
      last_login: updatedUser.last_login,
      created_at: updatedUser.created_at,
    };

    return apiSuccess({ user: userPayload }, 'Profile updated successfully.');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update profile.', 500);
  }
}
