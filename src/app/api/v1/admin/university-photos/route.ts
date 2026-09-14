import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');

    const where: any = {};
    if (university_id) {
      where.university_id = parseInt(university_id, 10);
    }

    const photos = await prisma.universityPhoto.findMany({
      where,
      include: {
        university: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ success: true, data: photos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university_id, title, photo_path, is_featured } = body;

    if (!university_id || !photo_path) {
      return NextResponse.json(
        { success: false, error: 'University ID and photo path are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM university_photos`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_photos (id, university_id, title, photo_path, is_featured, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      nextId,
      parseInt(university_id, 10),
      title || null,
      photo_path,
      is_featured ? 1 : 0,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Photo added' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to add photo' },
      { status: 500 }
    );
  }
}

