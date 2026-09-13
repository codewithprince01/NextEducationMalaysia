import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching url_redirections:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch url redirections', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { old_url, new_url } = body;

    if (!old_url || !new_url) {
      return NextResponse.json({ status: false, message: 'Both old_url and new_url are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO url_redirections (old_url, new_url, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      old_url.trim(),
      new_url.trim(),
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Record has been added successfully.' });
  } catch (error: any) {
    console.error('Error creating url_redirection:', error);
    return NextResponse.json({ status: false, message: 'Failed to create url redirection', error: error.message }, { status: 500 });
  }
}

