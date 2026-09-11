import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const images: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM default_og_images ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(images),
    });
  } catch (error: any) {
    console.error('Error fetching default OG images:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch default OG images', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { og_image_path, is_default } = body;

    if (!og_image_path) {
      return NextResponse.json({ status: false, message: 'Image path is required' }, { status: 400 });
    }

    const now = new Date();
    const defaultVal = is_default ? 1 : 0;

    if (defaultVal === 1) {
      // Unset previous defaults
      await prisma.$executeRawUnsafe(`UPDATE default_og_images SET is_default = 0`);
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO default_og_images (og_image_path, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      og_image_path,
      defaultVal,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Default OG image created successfully' });
  } catch (error: any) {
    console.error('Error creating default OG image:', error);
    return NextResponse.json({ status: false, message: 'Failed to create default OG image', error: error.message }, { status: 500 });
  }
}
