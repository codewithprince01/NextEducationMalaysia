import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM static_page_seos WHERE id = ? LIMIT 1`,
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
    const {
      page,
      url,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating,
      best_rating,
      review_number,
      page_content
    } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM static_page_seos WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE static_page_seos 
       SET page = ?, url = ?, meta_title = ?, meta_description = ?, meta_keyword = ?, og_image_path = ?,
           seo_rating = ?, best_rating = ?, review_number = ?, page_content = ?, updated_at = ?
       WHERE id = ?`,
      page,
      url || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      seo_rating !== undefined && seo_rating !== '' && seo_rating !== null ? parseFloat(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' && best_rating !== null ? parseFloat(best_rating) : null,
      review_number !== undefined && review_number !== '' && review_number !== null ? parseInt(review_number, 10) : null,
      page_content || null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'static-page-seos',
      recordId: id,
      description: `Updated static page SEO '${page || oldValues?.page || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Static page SEO updated successfully' });
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
      `SELECT * FROM static_page_seos WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM static_page_seos WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'static-page-seos',
      recordId: id,
      description: `Deleted static page SEO '${oldValues?.page || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Static page SEO deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
