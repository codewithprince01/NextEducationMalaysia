import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specId = searchParams.get('specialization_id');

    let sql = `SELECT * FROM specialization_contents`;
    const params: any[] = [];

    if (specId) {
      sql += ` WHERE specialization_id = ?`;
      params.push(Number(specId));
    }

    sql += ` ORDER BY position ASC, id ASC`;

    const contents: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(contents),
    });
  } catch (error: any) {
    console.error('Error fetching specialization contents:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch contents', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { specialization_id, tab, position, description } = body;

    if (!specialization_id) {
      return NextResponse.json({ status: false, message: 'Specialization ID is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO specialization_contents (specialization_id, tab, position, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      Number(specialization_id),
      tab || 'Overview',
      position !== undefined ? Number(position) : 1,
      description || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Content tab added successfully' });
  } catch (error: any) {
    console.error('Error creating specialization content:', error);
    return NextResponse.json({ status: false, message: 'Failed to add content tab', error: error.message }, { status: 500 });
  }
}
