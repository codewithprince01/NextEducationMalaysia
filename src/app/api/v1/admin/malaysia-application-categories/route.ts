import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT mac.*, mac.category_name AS category, mac.category_name AS name FROM malaysia_application_categories mac ORDER BY mac.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(categories),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch categories', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category_name, color_class } = body;

    if (!category_name) {
      return NextResponse.json({ status: false, message: 'Category name is required' }, { status: 400 });
    }

    const category_slug = slugify(category_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO malaysia_application_categories (category_name, category_slug, color_class, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      category_name,
      category_slug,
      color_class || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Category created successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to create category', error: error.message }, { status: 500 });
  }
}
