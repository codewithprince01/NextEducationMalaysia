import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM static_page_contents WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Static page content not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows[0]),
    });
  } catch (error: any) {
    console.error('Error fetching static page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch static page content', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { page_name, title, position, author_id, heading, description } = body;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE static_page_contents 
       SET page_name = ?, title = ?, position = ?, author_id = ?, heading = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      page_name || 'University Page Content',
      title || 'University Page Content',
      position || null,
      author_id ? parseInt(author_id, 10) : null,
      heading || null,
      description || null,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Static page content updated successfully' });
  } catch (error: any) {
    console.error('Error updating static page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to update static page content', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM static_page_contents WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Static page content deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting static page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete static page content', error: error.message }, { status: 500 });
  }
}

