import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, role, status, department, permissions, created_at, updated_at FROM users WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows[0]),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, email, password, role, status, department } = body;

    const now = new Date();

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.$executeRawUnsafe(
        `UPDATE users 
         SET name = ?, email = ?, password = ?, role = ?, status = ?, department = ?, updated_at = ?
         WHERE id = ?`,
        name,
        email,
        hashedPassword,
        role || 'subadmin',
        status !== undefined ? parseInt(status, 10) : 1,
        department || null,
        now,
        id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE users 
         SET name = ?, email = ?, role = ?, status = ?, department = ?, updated_at = ?
         WHERE id = ?`,
        name,
        email,
        role || 'subadmin',
        status !== undefined ? parseInt(status, 10) : 1,
        department || null,
        now,
        id
      );
    }

    return NextResponse.json({ status: true, message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM users WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
