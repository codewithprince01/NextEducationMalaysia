import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const images: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM default_og_images ORDER BY id DESC`
    );

    const normalized = images.map((item) => ({
      ...item,
      page: item.page || 'all',
      file_name: item.file_name || item.og_image_path || '',
      file_path: item.file_path || item.og_image_path || '',
      og_image_path: item.file_path || item.og_image_path || '',
      is_default: item.default ?? item.is_default ?? 1,
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(normalized),
    });
  } catch (error: any) {
    console.error('Error fetching default OG images:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch default OG images', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page, file_name, file_path, og_image_path } = body;

    const targetPage = page || 'all';
    const filePathVal = file_path || og_image_path || '';
    const fileNameVal = file_name || filePathVal.split('/').pop() || filePathVal;

    if (!filePathVal && !fileNameVal) {
      return NextResponse.json({ status: false, message: 'File is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO default_og_images (page, file_name, file_path, \`default\`, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      targetPage,
      fileNameVal,
      filePathVal.startsWith('uploads/') ? filePathVal : `uploads/seo/${filePathVal}`,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Default OG image created successfully' });
  } catch (error: any) {
    console.error('Error creating default OG image:', error);
    return NextResponse.json({ status: false, message: 'Failed to create default OG image', error: error.message }, { status: 500 });
  }
}
