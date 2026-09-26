import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT uf.*, IFNULL(uf.facility, '') AS title, u.name AS university_name
       FROM university_facilities uf
       LEFT JOIN universities u ON u.id = uf.u_id
       WHERE uf.id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeBigInt(rows[0]) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch facility' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await request.json();
    const { facility, title, description } = body;
    const facilityTitle = title || facility;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_facilities WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_facilities 
       SET facility = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      facilityTitle,
      description || '',
      now,
      id
    );

    await recordAuditLog({
      req: request,
      action: 'UPDATE',
      module: 'university-facilities',
      recordId: id,
      description: `Updated campus facility '${facilityTitle || oldValues?.title}' for University #${oldValues?.u_id || ''} (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ success: true, message: 'Facility updated successfully' });
  } catch (error: any) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update facility' },
      { status: 500 }
    );
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
      `SELECT * FROM university_facilities WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM university_facilities WHERE id = ?`, id);

    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'university-facilities',
      recordId: id,
      description: `Deleted campus facility '${oldValues?.title || oldValues?.facility || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ success: true, message: 'Facility deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}

