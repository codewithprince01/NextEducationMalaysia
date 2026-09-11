import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM services WHERE id = ? LIMIT 1`,
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
    const { title, uri, shortnote, thumbnail_path, meta_title, meta_description, meta_keyword, og_image_path, banner_path } = body;

    const slug = uri || (title ? slugify(title) : '');
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE services 
       SET title = ?, uri = ?, shortnote = ?, thumbnail_path = ?, meta_title = ?, meta_description = ?, meta_keyword = ?, og_image_path = ?, banner_path = ?, updated_at = ?
       WHERE id = ?`,
      title,
      slug,
      shortnote || null,
      thumbnail_path || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      banner_path || null,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Service updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM services WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
