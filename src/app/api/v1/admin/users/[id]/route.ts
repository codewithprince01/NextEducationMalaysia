import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, mobile, username, role, status, department, permissions, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const user = rows[0];
    let parsedPerms: Record<string, Record<string, number>> = {};
    if (user.permissions) {
      try {
        parsedPerms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch {
        parsedPerms = {};
      }
    }
    user.permissions = parsedPerms;

    return NextResponse.json({
      status: true,
      data: serializeBigInt(user),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();

    // Check if this is a permissions-only update or user profile update
    if (body.permissions !== undefined && body.name === undefined) {
      const permissionsStr = JSON.stringify(body.permissions || {});
      await prisma.$executeRawUnsafe(
        `UPDATE users SET permissions = ?, updated_at = ? WHERE id = ?`,
        permissionsStr,
        new Date(),
        id
      );
      return NextResponse.json({ status: true, message: 'Permissions updated successfully' });
    }

    const { name, email, mobile, password, role, status, department, permissions } = body;
    const now = new Date();
    const permissionsStr = permissions ? JSON.stringify(permissions) : undefined;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (permissionsStr !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE users 
           SET name = ?, email = ?, mobile = ?, password = ?, role = ?, status = ?, department = ?, permissions = ?, updated_at = ?
           WHERE id = ?`,
          name,
          email,
          mobile || '',
          hashedPassword,
          role || 'subadmin',
          status !== undefined ? parseInt(status, 10) : 1,
          department || null,
          permissionsStr,
          now,
          id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE users 
           SET name = ?, email = ?, mobile = ?, password = ?, role = ?, status = ?, department = ?, updated_at = ?
           WHERE id = ?`,
          name,
          email,
          mobile || '',
          hashedPassword,
          role || 'subadmin',
          status !== undefined ? parseInt(status, 10) : 1,
          department || null,
          now,
          id
        );
      }
    } else {
      if (permissionsStr !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE users 
           SET name = ?, email = ?, mobile = ?, role = ?, status = ?, department = ?, permissions = ?, updated_at = ?
           WHERE id = ?`,
          name,
          email,
          mobile || '',
          role || 'subadmin',
          status !== undefined ? parseInt(status, 10) : 1,
          department || null,
          permissionsStr,
          now,
          id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE users 
           SET name = ?, email = ?, mobile = ?, role = ?, status = ?, department = ?, updated_at = ?
           WHERE id = ?`,
          name,
          email,
          mobile || '',
          role || 'subadmin',
          status !== undefined ? parseInt(status, 10) : 1,
          department || null,
          now,
          id
        );
      }
    }

    return NextResponse.json({ status: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM users WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
