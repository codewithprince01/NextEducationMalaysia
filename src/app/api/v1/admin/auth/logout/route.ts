import { NextResponse } from 'next/server';
import { recordAuditLog } from '@/lib/auditLogger';

export async function POST(req: Request) {
  try {
    await recordAuditLog({
      req,
      action: 'LOGOUT',
      module: 'auth',
      description: 'Admin user logged out successfully',
    });
  } catch (e) {
    console.error('Audit log error on logout:', e);
  }

  const res = NextResponse.json({
    status: true,
    message: 'Successfully logged out.',
  });

  res.cookies.set('admin_access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}
