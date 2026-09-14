import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const types: any[] = await prisma.$queryRawUnsafe(
      `SELECT it.*, (SELECT COUNT(*) FROM universities u WHERE u.institute_type = it.id) AS university_count
       FROM institute_types it
       WHERE it.website = 'MYS'
       ORDER BY it.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(types),
    });
  } catch (error: any) {
    console.error('Error fetching institute types:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch institute types', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, seo_title } = body;

    if (!type) {
      return NextResponse.json({ status: false, message: 'Institute type name is required' }, { status: 400 });
    }

    const slug = slugify(type);
    const seoTitle = seo_title || type;
    const seoTitleSlug = slugify(seoTitle);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO institute_types (website, type, slug, seo_title, seo_title_slug, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?)`,
      type,
      slug,
      seoTitle,
      seoTitleSlug,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Institute type created successfully' });
  } catch (error: any) {
    console.error('Error creating institute type:', error);
    return NextResponse.json({ status: false, message: 'Failed to create institute type', error: error.message }, { status: 500 });
  }
}
