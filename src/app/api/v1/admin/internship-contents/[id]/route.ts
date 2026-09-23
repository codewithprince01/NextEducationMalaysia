import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { tab, description, position } = body;

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM internship_contents WHERE id = ? LIMIT 1`,
      id
    );
    const existing = existingRows?.[0] || null;

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE internship_contents SET
        tab = COALESCE(?, tab),
        description = COALESCE(?, description),
        position = COALESCE(?, position),
        updated_at = ?
       WHERE id = ?`,
      tab ?? null,
      description ?? null,
      position ? parseInt(position, 10) : null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'internship-contents',
      recordId: id,
      description: `Updated internship content for tab '${tab || existing?.tab || ''}' (ID: ${id})`,
      oldValues: existing,
      newValues: {
        id,
        tab: tab ?? existing?.tab,
        position: position ?? existing?.position,
      },
    });

    return NextResponse.json({ status: true, message: 'Internship content updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to update content', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM internship_contents WHERE id = ? LIMIT 1`,
      id
    );
    const existing = existingRows?.[0] || null;

    await prisma.$executeRawUnsafe(`DELETE FROM internship_contents WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'internship-contents',
      recordId: id,
      description: `Deleted internship content (ID: ${id})`,
      oldValues: existing,
    });

    return NextResponse.json({ status: true, message: 'Internship content deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete content', error: error.message },
      { status: 500 }
    );
  }
}

