import { NextResponse } from 'next/server';

export async function POST() {
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
