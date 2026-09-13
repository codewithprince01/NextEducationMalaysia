import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_banners WHERE website = 'MYS' OR website IS NULL ORDER BY id DESC`
    );

    const formatted = rows.map((r) => ({
      ...r,
      banner_path: r.banner_path
        ? r.banner_path.startsWith('/')
          ? r.banner_path
          : `/${r.banner_path}`
        : '',
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching page_banners:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch page banners', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let page = 'home';
    let alt_text = '';
    let title = '';
    let description = '';
    let banner_name = '';
    let banner_path = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      page = (formData.get('page') as string) || 'home';
      alt_text = (formData.get('alt_text') as string) || '';
      title = (formData.get('title') as string) || '';
      description = (formData.get('description') as string) || '';

      const file = formData.get('banner') as File | null;
      if (file && typeof file === 'object' && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name);
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        banner_name = fileName;
        banner_path = `uploads/banners/${fileName}`;
      }
    } else {
      const body = await req.json();
      page = body.page || 'home';
      alt_text = body.alt_text || '';
      title = body.title || '';
      description = body.description || '';
      banner_path = body.banner_path || '';
    }

    if (!alt_text.trim()) {
      return NextResponse.json({ status: false, message: 'Alt text is required' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO page_banners (website, page, alt_text, title, description, banner_name, banner_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      'MYS',
      page,
      alt_text,
      title,
      description,
      banner_name,
      banner_path
    );

    return NextResponse.json({
      status: true,
      message: 'Page banner created successfully',
    });
  } catch (error: any) {
    console.error('Error creating page banner:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create page banner', error: error.message },
      { status: 500 }
    );
  }
}

