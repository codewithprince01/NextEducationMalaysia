import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const exams: any[] = await prisma.$queryRawUnsafe(
      `SELECT e.*, e.headline AS title, e.headline AS name, e.uri AS slug FROM exams e ORDER BY e.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(exams),
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch exams', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, title, uri, description, meta_title, meta_description, meta_keyword } = body;
    const examName = name || title;

    if (!examName) {
      return NextResponse.json({ status: false, message: 'Exam name is required' }, { status: 400 });
    }

    const slug = uri || slugify(examName);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO exams (website, page_name, headline, uri, description, imgname, imgpath, meta_title, meta_description, meta_keyword, page_content, fees, views, status, hview, position, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, '', '', ?, ?, ?, '', '', 0, 1, 0, 0, ?, ?)`,
      examName,
      examName,
      slug,
      description || '',
      meta_title || '',
      meta_description || '',
      meta_keyword || '',
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Exam created successfully' });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ status: false, message: 'Failed to create exam', error: error.message }, { status: 500 });
  }
}
