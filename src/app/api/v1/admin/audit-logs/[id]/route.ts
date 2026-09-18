import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM admin_audit_logs WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Audit record not found' }, { status: 404 });
    }

    const log = rows[0];
    let parsedOld = null;
    let parsedNew = null;
    let parsedDiff = null;

    try { if (log.old_values) parsedOld = JSON.parse(log.old_values); } catch {}
    try { if (log.new_values) parsedNew = JSON.parse(log.new_values); } catch {}
    try { if (log.diff_values) parsedDiff = JSON.parse(log.diff_values); } catch {}

    const formatted = {
      ...log,
      old_values: parsedOld,
      new_values: parsedNew,
      diff_values: parsedDiff,
    };

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching audit log detail:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch audit log detail', error: error.message },
      { status: 500 }
    );
  }
}
