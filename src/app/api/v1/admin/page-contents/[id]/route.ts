import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT pc.*, a.name as author_name 
       FROM page_contents pc 
       LEFT JOIN authors a ON pc.author_id = a.id 
       WHERE pc.id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Page content not found' }, { status: 404 });
    }

    const item = rows[0];
    item.author = item.author_name ? { id: item.author_id, name: item.author_name } : null;

    return NextResponse.json({
      status: true,
      data: serializeBigInt(item),
    });
  } catch (error: any) {
    console.error('Error fetching page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch page content', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { page_name, author_id, heading, description } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_contents WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE page_contents 
       SET page_name = ?, author_id = ?, heading = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      page_name,
      author_id ? parseInt(author_id, 10) : null,
      heading || null,
      description || null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'page-contents',
      recordId: id,
      description: `Updated page content for '${page_name || oldValues?.page_name || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Page content updated successfully' });
  } catch (error: any) {
    console.error('Error updating page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to update page content', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_contents WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM page_contents WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'page-contents',
      recordId: id,
      description: `Deleted page content '${oldValues?.page_name || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Page content deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting page content:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete page content', error: error.message }, { status: 500 });
  }
}

