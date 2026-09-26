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
      `SELECT * FROM testimonials WHERE id = ? LIMIT 1`,
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
    const { name, university_name, program_name, rating, review, student_image } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM testimonials WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE testimonials 
       SET name = ?, university_name = ?, program_name = ?, rating = ?, review = ?, student_image = ?, updated_at = ?
       WHERE id = ?`,
      name,
      university_name || null,
      program_name || null,
      rating ? parseInt(rating, 10) : 5,
      review || null,
      student_image || null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'testimonials',
      recordId: id,
      description: `Updated testimonial for '${name || oldValues?.name || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Testimonial updated successfully' });
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
      `SELECT * FROM testimonials WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM testimonials WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'testimonials',
      recordId: id,
      description: `Deleted testimonial for '${oldValues?.name || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
