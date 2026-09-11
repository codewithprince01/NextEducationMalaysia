import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT fc.*, fc.category_name AS category FROM faq_categories fc ORDER BY fc.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(categories),
    });
  } catch (error: any) {
    console.error('Error fetching FAQ categories:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch FAQ categories', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category_name } = body;

    if (!category_name) {
      return NextResponse.json({ status: false, message: 'Category name is required' }, { status: 400 });
    }

    const category_slug = slugify(category_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO faq_categories (category_name, category_slug, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      category_name,
      category_slug,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'FAQ category created successfully' });
  } catch (error: any) {
    console.error('Error creating FAQ category:', error);
    return NextResponse.json({ status: false, message: 'Failed to create FAQ category', error: error.message }, { status: 500 });
  }
}
