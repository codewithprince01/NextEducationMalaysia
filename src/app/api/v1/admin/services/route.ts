import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const services: any[] = await prisma.$queryRawUnsafe(`
      SELECT sp.*, 
        (SELECT COUNT(*) FROM site_page_tabs spt WHERE spt.page_id = sp.id) AS content_count
      FROM site_pages sp
      WHERE sp.website = 'MYS'
      ORDER BY sp.id DESC
    `);

    const normalized = services.map((item) => ({
      ...item,
      page_name: item.page_name || '',
      headline: item.headline || '',
      imgpath: item.thumbnail_path || item.imgpath || '',
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(normalized),
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch services', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    if (!pageNameVal) {
      return NextResponse.json({ status: false, message: 'Enter Page Name is required' }, { status: 400 });
    }

    const uri = slugify(pageNameVal);
    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM site_pages`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO site_pages (
        id, website, page_name, uri, headline, thumbnail_name, thumbnail_path,
        meta_title, meta_description, meta_keyword,
        seo_rating, best_rating, review_number, og_image_path, status, hview, position, created_at, updated_at
      ) VALUES (?, 'MYS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?)`,
      nextId,
      pageNameVal,
      uri,
      headlineVal,
      thumbnailVal ? thumbnailVal.split('/').pop() : null,
      thumbnailVal ? (thumbnailVal.startsWith('uploads/') ? thumbnailVal : `uploads/services/${thumbnailVal}`) : null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      seo_rating !== undefined && seo_rating !== '' && seo_rating !== null ? parseFloat(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' && best_rating !== null ? parseFloat(best_rating) : null,
      review_number !== undefined && review_number !== '' && review_number !== null ? parseInt(review_number, 10) : null,
      og_image_path || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Service created successfully' });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ status: false, message: 'Failed to create service', error: error.message }, { status: 500 });
  }
}
