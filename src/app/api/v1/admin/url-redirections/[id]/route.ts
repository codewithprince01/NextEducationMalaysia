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
    const { old_url, new_url, status_code = 301, status = 1 } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    if (!old_url || !new_url) {
      return NextResponse.json({ status: false, message: 'Both old_url and new_url are required' }, { status: 400 });
    }

    const now = new Date();
    const code = Number(status_code) || 301;
    const st = status !== undefined ? (Number(status) ? 1 : 0) : 1;

    await prisma.$executeRawUnsafe(
      `UPDATE url_redirections 
       SET old_url = ?, new_url = ?, status_code = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      old_url.trim(),
      new_url.trim(),
      code,
      st,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'url-redirections',
      recordId: id,
      description: `Updated URL redirection #${id}`,
      oldValues,
      newValues: { id, old_url, new_url, status_code: code, status: st },
    });

    return NextResponse.json({ status: true, message: 'Record has been updated successfully.' });
  } catch (error: any) {
    console.error('Error updating url_redirection:', error);
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM url_redirections WHERE id = ? LIMIT 1`,
      id
    );
    if (!oldRows) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const nextStatus = body.status !== undefined ? (Number(body.status) ? 1 : 0) : (oldRows.status === 1 ? 0 : 1);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE url_redirections SET status = ?, updated_at = ? WHERE id = ?`,
      nextStatus,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'url-redirections',
      recordId: id,
      description: `Toggled status of URL redirection #${id} to ${nextStatus === 1 ? 'Active' : 'Inactive'}`,
      oldValues: oldRows,
      newValues: { status: nextStatus },
    });

    return NextResponse.json({
      status: true,
      message: `Status updated to ${nextStatus === 1 ? 'Active' : 'Inactive'}`,
      data: { id, status: nextStatus },
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to toggle status', error: error.message }, { status: 500 });
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

