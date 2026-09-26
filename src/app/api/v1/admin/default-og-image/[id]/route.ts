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
      `SELECT * FROM default_og_images WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const item = rows[0];
    const normalized = {
      ...item,
      page: item.page || 'all',
      file_name: item.file_name || item.og_image_path || '',
      file_path: item.file_path || item.og_image_path || '',
      og_image_path: item.file_path || item.og_image_path || '',
      is_default: item.default ?? item.is_default ?? 1,
    };

    return NextResponse.json({
      status: true,
      data: serializeBigInt(normalized),
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
    const { page, file_name, file_path, og_image_path } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM default_og_images WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const targetPage = page || 'all';
    const filePathVal = file_path || og_image_path || '';
    const fileNameVal = file_name || filePathVal.split('/').pop() || filePathVal;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE default_og_images 
       SET page = ?, file_name = ?, file_path = ?, updated_at = ?
       WHERE id = ?`,
      targetPage,
      fileNameVal,
      filePathVal.startsWith('uploads/') ? filePathVal : `uploads/seo/${filePathVal}`,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'default-og-image',
      recordId: id,
      description: `Updated default OG image for '${targetPage}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Default OG image updated successfully' });
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
      `SELECT * FROM default_og_images WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM default_og_images WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'default-og-image',
      recordId: id,
      description: `Deleted default OG image for '${oldValues?.page || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Default OG image deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
