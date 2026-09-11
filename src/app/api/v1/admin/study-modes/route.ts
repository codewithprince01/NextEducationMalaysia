import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const modes: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM study_modes ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(modes),
    });
  } catch (error: any) {
    console.error('Error fetching study modes:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch study modes', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { study_mode } = body;

    if (!study_mode) {
      return NextResponse.json({ status: false, message: 'Study mode name is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO study_modes (study_mode, created_at, updated_at)
       VALUES (?, ?, ?)`,
      study_mode,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Study mode created successfully' });
  } catch (error: any) {
    console.error('Error creating study mode:', error);
    return NextResponse.json({ status: false, message: 'Failed to create study mode', error: error.message }, { status: 500 });
  }
}
