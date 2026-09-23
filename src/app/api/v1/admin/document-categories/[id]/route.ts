import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    const [category]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_document_categories WHERE id = ?`,
      catId
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(category),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    const body = await request.json();

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_document_categories WHERE id = ? LIMIT 1`,
      catId
    );
    const oldValues = oldRows || null;

    const { name, description, icon, position, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE university_document_categories
       SET name = ?, description = ?, icon = ?, position = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      name.trim(),
      description || null,
      icon || 'ri-folder-line',
      position !== undefined && position !== null ? parseInt(position, 10) : 0,
      status ? 1 : 0,
      now,
      catId
    );

    await recordAuditLog({
      req: request,
      action: 'UPDATE',
      module: 'document-categories',
      recordId: catId,
      description: `Updated document category '${name.trim() || oldValues?.name || catId}' (ID: ${catId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update category', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_document_categories WHERE id = ? LIMIT 1`,
      catId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(
      `DELETE FROM university_document_categories WHERE id = ?`,
      catId
    );

    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'document-categories',
      recordId: catId,
      description: `Deleted document category '${oldValues?.name || catId}' (ID: ${catId})`,
      oldValues,
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: error.message },
      { status: 500 }
    );
  }
}

