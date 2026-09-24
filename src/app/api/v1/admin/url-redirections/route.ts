import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

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
    const { old_url, new_url, status_code = 301, status = 1 } = body;

    if (!old_url || !new_url) {
      return NextResponse.json({ status: false, message: 'Both old_url and new_url are required' }, { status: 400 });
    }

    const now = new Date();
    const code = Number(status_code) || 301;
    const st = status !== undefined ? (Number(status) ? 1 : 0) : 1;

    await prisma.$executeRawUnsafe(
      `INSERT INTO url_redirections (old_url, new_url, status_code, status, hits, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      old_url.trim(),
      new_url.trim(),
      code,
      st,
      now,
      now
    );

    const [lastInsert]: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const newId = lastInsert?.id ? Number(lastInsert.id) : undefined;

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'url-redirections',
      recordId: newId,
      description: `Created URL redirection (${code}) '${old_url}' to '${new_url}'`,
      newValues: { old_url, new_url, status_code: code, status: st },
    });

    return NextResponse.json({ status: true, message: 'Record has been added successfully.' });
  } catch (error: any) {
    console.error('Error creating url_redirection:', error);
    return NextResponse.json({ status: false, message: 'Failed to create url redirection', error: error.message }, { status: 500 });
  }
}

