import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import { recordAuditLog } from '@/lib/auditLogger';

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

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, mobile, username, role, status, department, permissions FROM users WHERE id = ? LIMIT 1`,
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const existingUser = existingRows[0];
    let existingPerms = {};
    try {
      if (existingUser.permissions) {
        existingPerms = typeof existingUser.permissions === 'string' ? JSON.parse(existingUser.permissions) : existingUser.permissions;
      }
    } catch {}

    // Check if this is a permissions-only update or user profile update
    if (body.permissions !== undefined && body.name === undefined) {
      const permissionsStr = JSON.stringify(body.permissions || {});
      await prisma.$executeRawUnsafe(
        `UPDATE users SET permissions = ?, updated_at = ? WHERE id = ?`,
        permissionsStr,
        new Date(),
        id
      );

      await recordAuditLog({
        req,
        action: 'UPDATE',
        module: 'permissions',
        recordId: id,
        description: `Updated module access permissions for user '${existingUser.name}' (${existingUser.email})`,
        oldValues: { id, name: existingUser.name, permissions: existingPerms },
        newValues: { id, name: existingUser.name, permissions: body.permissions },
      });

      return NextResponse.json({ status: true, message: 'Permissions updated successfully' });
    }

    const { name, email, mobile, password, role, status, department, permissions } = body;
    const now = new Date();
    const permissionsStr = permissions ? JSON.stringify(permissions) : undefined;

    const oldSnapshot = {
      id,
      name: existingUser.name,
      email: existingUser.email,
      mobile: existingUser.mobile,
      role: existingUser.role,
      status: Number(existingUser.status),
      department: existingUser.department,
    };

    const newSnapshot = {
      id,
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
      mobile: mobile ?? existingUser.mobile,
      role: role ?? existingUser.role,
      status: status !== undefined ? parseInt(status, 10) : Number(existingUser.status),
      department: department ?? existingUser.department,
    };

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

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'users',
      recordId: id,
      description: `Updated profile details for user '${name || existingUser.name}' (${email || existingUser.email})`,
      oldValues: oldSnapshot,
      newValues: newSnapshot,
    });

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

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, mobile, role, status FROM users WHERE id = ? LIMIT 1`,
      id
    );

    const targetUser = existingRows?.[0] || null;

    await prisma.$executeRawUnsafe(`DELETE FROM users WHERE id = ?`, id);

    if (targetUser) {
      await recordAuditLog({
        req,
        action: 'DELETE',
        module: 'users',
        recordId: id,
        description: `Deleted user '${targetUser.name}' (${targetUser.email})`,
        oldValues: targetUser,
      });
    }

    return NextResponse.json({ status: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
