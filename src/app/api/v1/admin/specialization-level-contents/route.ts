import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify, serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialization_level_id = searchParams.get('specialization_level_id');

    let sql = `
      SELECT slc.*, sl.level as level_name
      FROM specialization_level_contents slc
      LEFT JOIN specialization_levels sl ON slc.specialization_level_id = sl.id
    `;
    const params: any[] = [];

    if (specialization_level_id) {
      sql += ` WHERE slc.specialization_level_id = ?`;
      params.push(Number(specialization_level_id));
    }

    sql += ` ORDER BY slc.position ASC, slc.id DESC`;

    const contents: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    // If specialization_level_id is provided, fetch level details
    let levelData = null;
    if (specialization_level_id) {
      const levelRes: any[] = await prisma.$queryRawUnsafe(
        `SELECT sl.id, sl.level, sl.specialization_id, cs.name as specialization_name 
         FROM specialization_levels sl
         LEFT JOIN course_specializations cs ON sl.specialization_id = cs.id
         WHERE sl.id = ? LIMIT 1`,
        Number(specialization_level_id)
      );
      if (levelRes.length > 0) levelData = levelRes[0];
    }

    return NextResponse.json({
      status: true,
      message: 'Specialization level contents retrieved successfully',
      level: levelData ? serializeBigInt(levelData) : null,
      data: serializeBigInt(contents),
    });
  } catch (error: any) {
    console.error('Error fetching specialization level contents:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch specialization level contents', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { specialization_level_id, title, description, position } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const slug = slugify(title);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO specialization_level_contents 
       (id, specialization_level_id, title, slug, description, position, created_at, updated_at)
       SELECT IFNULL(MAX(id), 0) + 1, ?, ?, ?, ?, ?, ?, ? FROM specialization_level_contents slc_max`,
      specialization_level_id ? Number(specialization_level_id) : null,
      title.trim(),
      slug,
      description || null,
      position ? Number(position) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Content tab created successfully' });
  } catch (error: any) {
    console.error('Error creating specialization level content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create content tab', error: error.message },
      { status: 500 }
    );
  }
}
