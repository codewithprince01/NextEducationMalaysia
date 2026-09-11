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
      `SELECT uo.*, uo.title AS tab, u.name AS university_name
       FROM university_overviews uo
       LEFT JOIN universities u ON u.id = uo.university_id
       WHERE uo.id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Overview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeBigInt(rows[0]) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch overview' },
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
    const { tab, title, description, position } = body;
    const tabTitle = title || tab;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_overviews 
       SET title = ?, description = ?, position = ?, updated_at = ?
       WHERE id = ?`,
      tabTitle,
      description || '',
      position ? parseInt(position, 10) : 0,
      now,
      id
    );

    return NextResponse.json({ success: true, message: 'Overview updated successfully' });
  } catch (error: any) {
    console.error('Error updating university overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update overview' },
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
    await prisma.$executeRawUnsafe(`DELETE FROM university_overviews WHERE id = ?`, id);

    return NextResponse.json({ success: true, message: 'Overview deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete overview' },
      { status: 500 }
    );
  }
}
