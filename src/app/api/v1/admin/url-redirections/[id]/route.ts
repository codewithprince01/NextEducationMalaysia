import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections WHERE id = ? LIMIT 1`,
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { old_url, new_url } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    if (!old_url || !new_url) {
      return NextResponse.json({ status: false, message: 'Both old_url and new_url are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE url_redirections 
       SET old_url = ?, new_url = ?, updated_at = ?
       WHERE id = ?`,
      old_url.trim(),
      new_url.trim(),
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'url-redirections',
      recordId: id,
      description: `Updated URL redirection '${old_url || oldValues?.old_url}' -> '${new_url || oldValues?.new_url}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Record has been updated successfully.' });
  } catch (error: any) {
    console.error('Error updating url_redirection:', error);
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

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM url_redirections WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'url-redirections',
      recordId: id,
      description: `Deleted URL redirection '${oldValues?.old_url || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting url_redirection:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}

