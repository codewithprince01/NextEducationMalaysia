import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT e.*,
              e.page_name AS name,
              e.headline AS headline,
              e.imgpath AS thumbnail_path,
              e.og_image AS og_image_path
       FROM exams e 
       WHERE e.website = 'MYS'
       ORDER BY e.position ASC, e.id DESC`
    );

    const formatted = rows.map((r) => ({
      ...r,
      thumbnail_path: r.thumbnail_path
        ? r.thumbnail_path.startsWith('/')
          ? r.thumbnail_path
          : `/${r.thumbnail_path}`
        : '',
      og_image_path: r.og_image_path
        ? r.og_image_path.startsWith('/')
          ? r.og_image_path
          : `/${r.og_image_path}`
        : '',
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch exams', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let page_name = '';
    let headline = '';
    let description = '';
    let position = '1';
    let meta_title = '';
    let meta_keyword = '';
    let meta_description = '';
    let seo_rating = '';
    let best_rating = '';
    let review_number = '';
    let imgname = '';
    let imgpath = '';
    let og_image = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      page_name = (formData.get('page_name') as string) || (formData.get('name') as string) || '';
      headline = (formData.get('headline') as string) || (formData.get('title') as string) || '';
      description = (formData.get('description') as string) || '';
      position = (formData.get('position') as string) || '1';
      meta_title = (formData.get('meta_title') as string) || '';
      meta_keyword = (formData.get('meta_keyword') as string) || '';
      meta_description = (formData.get('meta_description') as string) || '';
      seo_rating = (formData.get('seo_rating') as string) || '';
      best_rating = (formData.get('best_rating') as string) || '';
      review_number = (formData.get('review_number') as string) || '';

      const thumbFile = formData.get('thumbnail') as File | null;
      if (thumbFile && typeof thumbFile === 'object' && thumbFile.name) {
        const buffer = Buffer.from(await thumbFile.arrayBuffer());
        const ext = path.extname(thumbFile.name);
        const baseName = path.basename(thumbFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_thumb_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'exams');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        imgname = fileName;
        imgpath = `uploads/exams/${fileName}`;
      }

      const ogFile = formData.get('og_image') as File | null;
      if (ogFile && typeof ogFile === 'object' && ogFile.name) {
        const buffer = Buffer.from(await ogFile.arrayBuffer());
        const ext = path.extname(ogFile.name);
        const baseName = path.basename(ogFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_og_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'exams');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        og_image = `uploads/exams/${fileName}`;
      }
    } else {
      const body = await req.json();
      page_name = body.page_name || body.name || '';
      headline = body.headline || body.title || '';
      description = body.description || '';
      position = String(body.position ?? '1');
      meta_title = body.meta_title || '';
      meta_keyword = body.meta_keyword || '';
      meta_description = body.meta_description || '';
      seo_rating = body.seo_rating || '';
      best_rating = body.best_rating || '';
      review_number = body.review_number || '';
      imgpath = body.imgpath || body.thumbnail_path || '';
      og_image = body.og_image || body.og_image_path || '';
    }

    if (!page_name.trim()) {
      return NextResponse.json({ status: false, message: 'Exam name is required' }, { status: 400 });
    }

    const uri = slugify(page_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO exams (
        website, page_name, uri, headline, position, description,
        imgname, imgpath, og_image,
        meta_title, meta_keyword, meta_description, seo_rating, best_rating, review_number,
        status, hview, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
      'MYS',
      page_name,
      uri,
      headline,
      parseInt(position, 10) || 1,
      description,
      imgname,
      imgpath,
      og_image,
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating,
      best_rating,
      review_number,
      now,
      now
    );

    return NextResponse.json({
      status: true,
      message: 'Exam created successfully',
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create exam', error: error.message },
      { status: 500 }
    );
  }
}
