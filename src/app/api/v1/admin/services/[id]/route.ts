import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM site_pages WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const item = rows[0];
    const normalized = {
      ...item,
      page_name: item.page_name || '',
      headline: item.headline || '',
      imgpath: item.thumbnail_path || '',
    };

    return NextResponse.json({
      status: true,
      data: serializeBigInt(normalized),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const {
      page_name,
      headline,
      imgpath,
      thumbnail_path,
      meta_title,
      meta_description,
      meta_keyword,
      seo_rating,
      best_rating,
      review_number,
      og_image_path,
    } = body;

    const pageNameVal = page_name || '';
    const headlineVal = headline || '';
    const thumbnailVal = imgpath || thumbnail_path || null;

    const uri = slugify(pageNameVal);
    const now = new Date();

    const formattedThumbnail = thumbnailVal
      ? thumbnailVal.startsWith('uploads/')
        ? thumbnailVal
        : `uploads/services/${thumbnailVal}`
      : null;

    await prisma.$executeRawUnsafe(
      `UPDATE site_pages 
       SET page_name = ?, uri = ?, headline = ?, thumbnail_name = ?, thumbnail_path = ?,
           meta_title = ?, meta_description = ?, meta_keyword = ?,
           seo_rating = ?, best_rating = ?, review_number = ?, og_image_path = ?, updated_at = ?
       WHERE id = ?`,
      pageNameVal,
      uri,
      headlineVal,
      thumbnailVal ? thumbnailVal.split('/').pop() : null,
      formattedThumbnail,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      seo_rating !== undefined && seo_rating !== '' && seo_rating !== null ? parseFloat(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' && best_rating !== null ? parseFloat(best_rating) : null,
      review_number !== undefined && review_number !== '' && review_number !== null ? parseInt(review_number, 10) : null,
      og_image_path || null,
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
    await prisma.$executeRawUnsafe(`DELETE FROM site_pages WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
