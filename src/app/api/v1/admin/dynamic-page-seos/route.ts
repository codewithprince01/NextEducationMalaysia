import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const seos: any[] = await prisma.$queryRawUnsafe(
      `SELECT dps.*, dps.url AS page FROM dynamic_page_seos dps ORDER BY dps.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(seos),
    });
  } catch (error: any) {
    console.error('Error fetching dynamic page SEOs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch dynamic page SEOs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, meta_title, meta_description, meta_keyword, og_image_path, page_content } = body;

    if (!url) {
      return NextResponse.json({ status: false, message: 'Target URL is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO dynamic_page_seos (website, url, meta_title, meta_description, meta_keyword, og_image_path, page_content, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?, ?, ?)`,
      url,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      page_content || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Dynamic page SEO created successfully' });
  } catch (error: any) {
    console.error('Error creating dynamic page SEO:', error);
    return NextResponse.json({ status: false, message: 'Failed to create dynamic page SEO', error: error.message }, { status: 500 });
  }
}
