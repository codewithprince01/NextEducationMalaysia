import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { facility, title, description } = body;
    const facilityTitle = title || facility;

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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM university_facilities WHERE id = ?`, id);

    return NextResponse.json({ success: true, message: 'Facility deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}
