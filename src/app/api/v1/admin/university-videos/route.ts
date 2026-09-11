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

    const videos = await prisma.universityVideo.findMany({
      where,
      include: {
        university: { select: { id: true, name: true } },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ success: true, data: videos });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university_id, title, video_url } = body;

    if (!university_id || !video_url) {
      return NextResponse.json(
        { success: false, error: 'University ID and Video URL are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM university_videos`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_videos (id, university_id, title, video_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      nextId,
      parseInt(university_id, 10),
      title || null,
      video_url,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Video added' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to add video' },
      { status: 500 }
    );
  }
}

