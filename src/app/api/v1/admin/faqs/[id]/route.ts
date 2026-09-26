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
      `SELECT * FROM faqs WHERE id = ? LIMIT 1`,
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
    const { category_id, question, answer, position } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM faqs WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();
    const pos = position ? parseInt(position, 10) : 0;
    const catId = category_id ? parseInt(category_id, 10) : null;

    await prisma.$executeRawUnsafe(
      `UPDATE faqs 
       SET category_id = ?, question = ?, answer = ?, position = ?, updated_at = ?
       WHERE id = ?`,
      catId,
      question,
      answer || null,
      pos,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'faqs',
      recordId: id,
      description: `Updated FAQ '${question || oldValues?.question || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'FAQ updated successfully' });
  } catch (error: any) {
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
      `SELECT * FROM faqs WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM faqs WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'faqs',
      recordId: id,
      description: `Deleted FAQ '${oldValues?.question || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'FAQ deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
