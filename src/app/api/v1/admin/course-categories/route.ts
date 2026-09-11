import { NextResponse } from 'next/server';
// Trigger Next.js route compilation
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

// GET /api/v1/admin/course-categories
export async function GET() {
  try {
    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT cc.*, 
              a.name as author_name,
              (SELECT COUNT(*) FROM course_category_contents ccc WHERE ccc.course_category_id = cc.id) as contents_count,
              (SELECT COUNT(*) FROM course_category_faqs ccf WHERE ccf.course_category_id = cc.id) as faqs_count
       FROM course_categories cc
       LEFT JOIN authors a ON cc.author_id = a.id
       WHERE cc.website = 'MYS'
       ORDER BY cc.id DESC`
    );

    return NextResponse.json({
      status: true,
      message: 'Course categories retrieved successfully',
      data: serializeBigInt(categories),
    });
  } catch (error: any) {
    console.error('Error fetching course categories:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/course-categories
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      author_id,
      shortnote,
      icon_class,
      courses_description,
      description,
      meta_title,
      meta_description,
      meta_keyword,
      seo_rating,
      best_rating,
      review_number,
      thumbnail_path,
      banner_path,
      content_image_path,
      og_image_path,
      status,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ status: false, message: 'Category name is required' }, { status: 400 });
    }

    const slug = slugify(name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO course_categories (
        name, slug, author_id, shortnote, icon_class, courses_description, 
        meta_title, meta_description, meta_keyword, seo_rating, best_rating, review_number,
        thumbnail_path, banner_path, content_image_path, og_image_path, 
        status, website, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MYS', ?, ?)`,
      name.trim(),
      slug,
      author_id ? Number(author_id) : null,
      shortnote || null,
      icon_class || null,
      courses_description || description || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      seo_rating || null,
      best_rating || null,
      review_number || null,
      thumbnail_path || null,
      banner_path || null,
      content_image_path || null,
      og_image_path || null,
      status !== undefined ? Number(status) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Category created successfully' });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}
