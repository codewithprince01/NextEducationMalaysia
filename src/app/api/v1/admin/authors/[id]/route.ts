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
      `SELECT * FROM authors WHERE id = ? LIMIT 1`,
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
    const { name, email, designation, bio, profile_image } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM authors WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE authors 
       SET name = ?, email = ?, designation = ?, bio = ?, profile_image = ?, updated_at = ?
       WHERE id = ?`,
      name,
      email || null,
      designation || null,
      bio || null,
      profile_image || null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'authors',
      recordId: id,
      description: `Updated author '${name || oldValues?.name || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Author updated successfully' });
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
      `SELECT * FROM authors WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM authors WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'authors',
      recordId: id,
      description: `Deleted author '${oldValues?.name || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Author deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
