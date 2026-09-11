import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('university_id');

    let sql = `SELECT up.*, u.uname as university_name, cc.name as category_name, cs.name as specialization_name
               FROM university_programs up
               LEFT JOIN universities u ON up.university_id = u.id
               LEFT JOIN course_categories cc ON up.course_category_id = cc.id
               LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
               WHERE up.website = 'MYS'`;
    const params: any[] = [];

    if (universityId) {
      sql += ` AND up.university_id = ?`;
      params.push(Number(universityId));
    }

    sql += ` ORDER BY up.id DESC LIMIT 300`;

    const programs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      message: 'Programs retrieved successfully',
      data: serializeBigInt(programs),
    });
  } catch (error: any) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch programs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      course_name,
      university_id,
      level,
      study_mode,
      duration,
      tution_fee,
      course_category_id,
      specialization_id,
      courses_description,
      status,
    } = body;

    if (!course_name || !course_name.trim()) {
      return NextResponse.json({ status: false, message: 'Course name is required' }, { status: 400 });
    }

    const slug = slugify(course_name);
    let finalUniId = university_id ? Number(university_id) : null;
    let finalCatId = course_category_id ? Number(course_category_id) : null;
    let finalSpecId = specialization_id ? Number(specialization_id) : null;

    if (!finalUniId) {
      const firstUni: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM universities LIMIT 1`);
      if (firstUni.length > 0) finalUniId = Number(firstUni[0].id);
    }
    if (!finalCatId) {
      const firstCat: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM course_categories LIMIT 1`);
      if (firstCat.length > 0) finalCatId = Number(firstCat[0].id);
    }
    if (!finalSpecId) {
      const firstSpec: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM course_specializations LIMIT 1`);
      if (firstSpec.length > 0) finalSpecId = Number(firstSpec[0].id);
    }

    const cleanFee = tution_fee ? String(tution_fee).replace(/[^\d.]/g, '') : '0';
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_programs (id, university_id, course_name, slug, level, study_mode, duration, tution_fee, course_category_id, specialization_id, status, website, created_at, updated_at)
       SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MYS', ?, ? FROM university_programs up_max`,
      finalUniId,
      course_name.trim(),
      slug,
      level || null,
      study_mode || null,
      duration || null,
      cleanFee || '0',
      finalCatId,
      finalSpecId,
      status !== undefined ? Number(status) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Program created successfully' });
  } catch (error: any) {
    console.error('Error creating program:', error);
    return NextResponse.json({ status: false, message: 'Failed to create program', error: error.message }, { status: 500 });
  }
}
