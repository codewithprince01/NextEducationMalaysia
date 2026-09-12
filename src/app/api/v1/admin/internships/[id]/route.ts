import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM internships WHERE id = ? LIMIT 1`,
      id
    );

    if (rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Internship not found' }, { status: 404 });
    }

    return NextResponse.json({ status: true, data: serializeBigInt(rows[0]) });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to fetch internship', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      active_status,
      thumbnail_path,
      thumbnail_name,
      shortnote,
      website = 'MYS',
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating,
      best_rating,
      review_number,
      og_image_name,
      og_image_path,
    } = body;

    const slugified = slug
      ? slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/[\s-]+/g, '-')
      : undefined;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE internships SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        active_status = COALESCE(?, active_status),
        thumbnail_name = COALESCE(?, thumbnail_name),
        thumbnail_path = COALESCE(?, thumbnail_path),
        shortnote = COALESCE(?, shortnote),
        website = COALESCE(?, website),
        meta_title = COALESCE(?, meta_title),
        meta_keyword = COALESCE(?, meta_keyword),
        meta_description = COALESCE(?, meta_description),
        seo_rating = ?,
        best_rating = ?,
        review_number = ?,
        og_image_name = COALESCE(?, og_image_name),
        og_image_path = COALESCE(?, og_image_path),
        updated_at = ?
      WHERE id = ?`,
      title ?? null,
      slugified ?? null,
      active_status ?? null,
      thumbnail_name ?? null,
      thumbnail_path ?? null,
      shortnote ?? null,
      website,
      meta_title ?? null,
      meta_keyword ?? null,
      meta_description ?? null,
      seo_rating ? parseFloat(seo_rating) : null,
      best_rating ? parseFloat(best_rating) : null,
      review_number ? parseInt(review_number, 10) : null,
      og_image_name ?? null,
      og_image_path ?? null,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Internship updated successfully' });
  } catch (error: any) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update internship', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM internships WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Internship deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete internship', error: error.message },
      { status: 500 }
    );
  }
}
