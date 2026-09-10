import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

// GET /api/v1/admin/course-specializations
export async function GET() {
  try {
    const specializations: any[] = await prisma.$queryRawUnsafe(
      `SELECT cs.*, 
              cc.name as category_name,
              a.name as author_name,
              (SELECT COUNT(*) FROM specialization_contents sc WHERE sc.specialization_id = cs.id) as contents_count,
              (SELECT COUNT(*) FROM course_specialization_faqs csf WHERE csf.specialization_id = cs.id) as faqs_count,
              (SELECT COUNT(*) FROM specialization_levels sl WHERE sl.specialization_id = cs.id) as levels_count
       FROM course_specializations cs
       LEFT JOIN course_categories cc ON cs.course_category_id = cc.id
       LEFT JOIN authors a ON cs.author_id = a.id
       WHERE cs.website = 'MYS'
       ORDER BY cs.id DESC`
    );

    return NextResponse.json({
      status: true,
      message: 'Course specializations retrieved successfully',
      data: serializeBigInt(specializations),
    });
  } catch (error: any) {
    console.error('Error fetching specializations:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch specializations', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/course-specializations
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      course_category_id,
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
      return NextResponse.json({ status: false, message: 'Specialization name is required' }, { status: 400 });
    }

    const slug = slugify(name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO course_specializations (
        name, slug, course_category_id, author_id, shortnote, icon_class, courses_description,
        meta_title, meta_description, meta_keyword, seo_rating, best_rating, review_number,
        thumbnail_path, banner_path, content_image_path, og_image_path,
        status, website, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MYS', ?, ?)`,
      name.trim(),
      slug,
      course_category_id ? Number(course_category_id) : null,
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

    return NextResponse.json({ status: true, message: 'Specialization created successfully' });
  } catch (error: any) {
    console.error('Error creating specialization:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create specialization', error: error.message },
      { status: 500 }
    );
  }
}
