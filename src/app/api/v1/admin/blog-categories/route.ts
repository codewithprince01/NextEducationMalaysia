import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `SELECT bc.id, bc.category_name, bc.category_slug, bc.meta_title, bc.meta_description, bc.meta_keyword,
               bc.og_image_path, bc.seo_rating, bc.best_rating, bc.review_number, bc.status, bc.created_at,
               COALESCE(b.cnt, 0) AS blog_count
               FROM blog_categories bc
               LEFT JOIN (SELECT category_id, COUNT(*) as cnt FROM blogs GROUP BY category_id) b ON b.category_id = bc.id`;

    if (search) {
      sql += ` WHERE bc.category_name LIKE '%${search}%' OR bc.category_slug LIKE '%${search}%'`;
    }

    sql += ` ORDER BY bc.id DESC`;

    const categories: any[] = await prisma.$queryRawUnsafe(sql);

    const formatted = categories.map((c) => ({
      ...c,
      _count: { blogs: Number(c.blog_count || 0) },
    }));

    return NextResponse.json({ success: true, data: serializeBigInt(formatted) });
  } catch (error: any) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      category_name,
      category_slug,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating,
      best_rating,
      review_number,
      status,
    } = body;

    if (!category_name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const slug = category_slug ? slugify(category_slug) : slugify(category_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO blog_categories (category_name, category_slug, website, meta_title, meta_description, meta_keyword, og_image_path, seo_rating, best_rating, review_number, status, created_at, updated_at)
       VALUES (?, ?, 'MYS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      category_name,
      slug,
      meta_title || '',
      meta_description || '',
      meta_keyword || '',
      og_image_path || '',
      seo_rating ? parseFloat(seo_rating) : null,
      best_rating ? parseFloat(best_rating) : null,
      review_number ? parseInt(review_number, 10) : null,
      status !== undefined ? parseInt(status, 10) : 1,
      now,
      now
    );

    await recordAuditLog({
      req: request,
      action: 'CREATE',
      module: 'blog-categories',
      description: `Created blog category '${category_name}'`,
      newValues: body,
    });

    return NextResponse.json({ success: true, message: 'Category created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog category' },
      { status: 500 }
    );
  }
}

