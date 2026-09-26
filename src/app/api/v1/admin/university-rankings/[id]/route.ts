import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await request.json();
    const { title, description, position } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_rankings WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_rankings SET title = ?, description = ?, position = ?, updated_at = ? WHERE id = ?`,
      title || '',
      description || '',
      position ? parseInt(position, 10) : 0,
      now,
      id
    );

    await recordAuditLog({
      req: request,
      action: 'UPDATE',
      module: 'university-ranking',
      recordId: id,
      description: `Updated ranking '${title || oldValues?.title}' for University #${oldValues?.university_id || ''} (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ success: true, message: 'Ranking updated successfully' });
  } catch (error: any) {
    console.error('Error updating ranking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ranking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_rankings WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM university_rankings WHERE id = ?`, id);

    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'university-ranking',
      recordId: id,
      description: `Deleted ranking '${oldValues?.title || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ success: true, message: 'Ranking deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete ranking' }, { status: 500 });
  }
}

