import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, mobile, username, role, status, department, permissions, created_at, updated_at 
       FROM users 
       WHERE status = 1
       ORDER BY id DESC`
    );

    const formatted = users.map((u) => {
      let parsedPerms: Record<string, Record<string, number>> = {};
      if (u.permissions) {
        try {
          parsedPerms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
        } catch {
          parsedPerms = {};
        }
      }

      let granted_count = 0;
      Object.values(parsedPerms).forEach((modPerms) => {
        if (modPerms && typeof modPerms === 'object') {
          if (Object.values(modPerms).some((val) => Boolean(val))) {
            granted_count++;
          }
        }
      });

      return {
        ...u,
        permissions: parsedPerms,
        granted_count,
      };
    });

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, mobile, role, status, department, permissions } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ status: false, message: 'Name, email, and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM users`);
    const nextId = Number(maxRes?.next_id || 1);

    const username = email.split('@')[0];
    const permissionsStr = permissions ? JSON.stringify(permissions) : '{}';

    await prisma.$executeRawUnsafe(
      `INSERT INTO users (
        id, website, loginid, username, name, email, mobile, image, university, ip, login_count, otp, front,
        status, ub, browser, browser_version, os, ip_address, mac, tp, branch, automatic_asign_lead, branch_id,
        export_lead, password, role, department, permissions, created_at, updated_at
      ) VALUES (?, 'MYS', ?, ?, ?, ?, ?, '', 0, '', '0', '', 0, ?, 0, '', '', '', '', '', 0, '', 0, 0, 0, ?, ?, ?, ?, ?, ?)`,
      nextId,
      email,
      username,
      name,
      email,
      mobile || '',
      status !== undefined ? parseInt(status, 10) : 1,
      hashedPassword,
      role || 'subadmin',
      department || null,
      permissionsStr,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Admin user created successfully' });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create admin user', error: error.message },
      { status: 500 }
    );
  }
}
