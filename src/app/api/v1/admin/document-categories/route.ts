import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT c.*,
             (SELECT COUNT(*) FROM university_documents d WHERE d.category_id = c.id) AS documents_count
      FROM university_document_categories c
      ORDER BY c.position ASC, c.id DESC
    `);

    return NextResponse.json({
      success: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching document categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch document categories', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, icon, position, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const [existing]: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS cnt FROM university_document_categories WHERE slug = ?`,
      slug
    );

    if (existing && Number(existing.cnt) > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    let nextPosition = position !== undefined && position !== null && position !== '' ? parseInt(position, 10) : null;
    if (nextPosition === null || isNaN(nextPosition)) {
      const [maxRes]: any[] = await prisma.$queryRawUnsafe(
        `SELECT IFNULL(MAX(position), 0) + 1 AS next_pos FROM university_document_categories`
      );
      nextPosition = Number(maxRes?.next_pos || 1);
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO university_document_categories (name, slug, description, icon, position, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      name.trim(),
      slug,
      description || null,
      icon || 'ri-folder-line',
      nextPosition,
      status !== undefined && status !== null ? (status ? 1 : 0) : 1,
      now,
      now
    );

    return NextResponse.json(
      { success: true, message: 'Category created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating document category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}

