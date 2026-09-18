import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

// GET /api/v1/admin/university-program-contents?c_id={program_id}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cId = searchParams.get('c_id') || searchParams.get('program_id');

    if (!cId) {
      return NextResponse.json(
        { status: false, message: 'Program ID (c_id) is required' },
        { status: 400 }
      );
    }

    const progId = Number(cId);

    // Fetch Program info with University details
    const programRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT up.id, up.course_name, up.university_id, u.name as university_name
       FROM university_programs up
       LEFT JOIN universities u ON up.university_id = u.id
       WHERE up.id = ? LIMIT 1`,
      progId
    );

    const program = programRows[0] || null;

    // Fetch contents list for this program
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_program_contents WHERE c_id = ? ORDER BY id DESC`,
      progId
    );

    return NextResponse.json({
      status: true,
      program: program ? serializeBigInt(program) : null,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching university program contents:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch program contents', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/university-program-contents
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { c_id, tab_title, heading, description, imgpath, imgname } = body;

    if (!c_id) {
      return NextResponse.json(
        { status: false, message: 'Program ID (c_id) is required' },
        { status: 400 }
      );
    }

    if (!tab_title || !tab_title.trim()) {
      return NextResponse.json(
        { status: false, message: 'Tab title is required' },
        { status: 400 }
      );
    }

    const now = new Date();

    let nextId: number | null = null;
    try {
      const maxRows: any[] = await prisma.$queryRawUnsafe(
        `SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM university_program_contents`
      );
      if (maxRows.length > 0 && maxRows[0].next_id) {
        nextId = Number(maxRows[0].next_id);
      }
    } catch {
      nextId = null;
    }

    if (nextId) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO university_program_contents (id, c_id, tab_title, heading, description, imgpath, imgname, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        nextId,
        Number(c_id),
        tab_title.trim(),
        heading?.trim() || null,
        description || null,
        imgpath || null,
        imgname || null,
        now,
        now
      );
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO university_program_contents (c_id, tab_title, heading, description, imgpath, imgname, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        Number(c_id),
        tab_title.trim(),
        heading?.trim() || null,
        description || null,
        imgpath || null,
        imgname || null,
        now,
        now
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Program content created successfully',
    });
  } catch (error: any) {
    console.error('Error creating university program content:', error);
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Failed to create program content',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
