import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization_id = searchParams.get('specialization_id');

    let sql = `
      SELECT sl.*, sl.level as level_name, cs.name as specialization_name,
             (SELECT COUNT(*) FROM specialization_level_contents slc WHERE slc.specialization_level_id = sl.id) as contents_count
      FROM specialization_levels sl
      LEFT JOIN course_specializations cs ON sl.specialization_id = cs.id
    `;
    const params: any[] = [];

    if (specialization_id) {
      sql += ` WHERE sl.specialization_id = ?`;
      params.push(Number(specialization_id));
    }

    sql += ` ORDER BY sl.id DESC`;

    const specializationLevels: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    // If specialization_id is provided, also fetch specialization details
    let specializationData = null;
    if (specialization_id) {
      const specRes: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, name, slug FROM course_specializations WHERE id = ? LIMIT 1`,
        Number(specialization_id)
      );
      if (specRes.length > 0) specializationData = specRes[0];
    }

    return NextResponse.json({
      status: true,
      message: 'Specialization levels retrieved successfully',
      specialization: specializationData ? serializeBigInt(specializationData) : null,
      data: serializeBigInt(specializationLevels),
    });
  } catch (error: any) {
    console.error('Error fetching specialization levels:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch specialization levels', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      specialization_id,
      level_name,
      level,
      duration,
      tuition_fees,
      intake,
      accreditation,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating,
      best_rating,
      review_number
    } = body;
    const nameToUse = level_name || level;

    if (!nameToUse || !nameToUse.trim()) {
      return NextResponse.json({ status: false, message: 'Level name is required' }, { status: 400 });
    }

    const level_slug = slugify(nameToUse);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO specialization_levels 
       (id, specialization_id, level, level_slug, duration, tuition_fees, intake, accreditation, 
        meta_title, meta_description, meta_keyword, og_image_path, seo_rating, best_rating, review_number, created_at, updated_at)
       SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM specialization_levels sl_max`,
      specialization_id ? Number(specialization_id) : null,
      nameToUse.trim(),
      level_slug,
      duration || null,
      tuition_fees || null,
      intake || null,
      accreditation || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      seo_rating !== undefined && seo_rating !== '' ? Number(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' ? Number(best_rating) : null,
      review_number !== undefined && review_number !== '' ? Number(review_number) : null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Specialization level created successfully' });
  } catch (error: any) {
    console.error('Error creating specialization level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create specialization level', error: error.message },
      { status: 500 }
    );
  }
}
