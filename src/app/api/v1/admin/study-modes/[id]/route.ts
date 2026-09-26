import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const modeId = Number(id);
    const body = await req.json();
    const { study_mode } = body;

    if (!study_mode) {
      return NextResponse.json({ status: false, message: 'Study mode name is required' }, { status: 400 });
    }

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM study_modes WHERE id = ? LIMIT 1`,
      modeId
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE study_modes 
       SET study_mode = ?, updated_at = ?
       WHERE id = ?`,
      study_mode,
      now,
      modeId
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'study-modes',
      recordId: modeId,
      description: `Updated study mode '${study_mode}' (ID: ${modeId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Study mode updated successfully' });
  } catch (error: any) {
    console.error('Error updating study mode:', error);
    return NextResponse.json({ status: false, message: 'Failed to update study mode', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const modeId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM study_modes WHERE id = ? LIMIT 1`,
      modeId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM study_modes WHERE id = ?`, modeId);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'study-modes',
      recordId: modeId,
      description: `Deleted study mode '${oldValues?.study_mode || modeId}' (ID: ${modeId})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Study mode deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting study mode:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete study mode', error: error.message }, { status: 500 });
  }
}

