import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM faq_categories WHERE id = ? LIMIT 1`,
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { category_name } = body;

    if (!category_name) {
      return NextResponse.json({ status: false, message: 'Category name is required' }, { status: 400 });
    }

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM faq_categories WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const category_slug = slugify(category_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE faq_categories 
       SET category_name = ?, category_slug = ?, updated_at = ?
       WHERE id = ?`,
      category_name,
      category_slug,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'faq-categories',
      recordId: id,
      description: `Updated FAQ category '${category_name}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'FAQ category updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM faq_categories WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM faq_categories WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'faq-categories',
      recordId: id,
      description: `Deleted FAQ category '${oldValues?.category_name || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'FAQ category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
