import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM default_og_images WHERE id = ? LIMIT 1`,
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { og_image_path, is_default } = body;

    const now = new Date();
    const defaultVal = is_default ? 1 : 0;

    if (defaultVal === 1) {
      await prisma.$executeRawUnsafe(`UPDATE default_og_images SET is_default = 0`);
    }

    await prisma.$executeRawUnsafe(
      `UPDATE default_og_images 
       SET og_image_path = ?, is_default = ?, updated_at = ?
       WHERE id = ?`,
      og_image_path,
      defaultVal,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Default OG image updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM default_og_images WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Default OG image deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
