import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

// GET /api/v1/admin/levels - Fetch all levels
export async function GET() {
  try {
    const levels: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM levels ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      message: 'Levels retrieved successfully',
      data: serializeBigInt(levels),
    });
  } catch (error: any) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch levels', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/levels - Create new level
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level, short_name, seo_name, courses_description } = body;

    if (!level || !level.trim()) {
      return NextResponse.json(
        { status: false, message: 'Level title is required' },
        { status: 400 }
      );
    }

    const slug = slugify(level);
    const shortNameSlug = short_name ? slugify(short_name) : null;
    const seoNameSlug = seo_name ? slugify(seo_name) : null;

    // Check duplicate
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM levels WHERE level = ? OR slug = ? LIMIT 1`,
      level.trim(),
      slug
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { status: false, message: 'Level with this name already exists' },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO levels (level, slug, short_name, short_name_slug, seo_name, seo_name_slug, courses_description, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      level.trim(),
      slug,
      short_name?.trim() || null,
      shortNameSlug,
      seo_name?.trim() || null,
      seoNameSlug,
      courses_description || null,
      now,
      now
    );

    return NextResponse.json({
      status: true,
      message: 'New level created successfully',
    });
  } catch (error: any) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create level', error: error.message },
      { status: 500 }
    );
  }
}
