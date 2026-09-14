import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT s.*,
              (SELECT COUNT(*) FROM scholarship_contents sc WHERE sc.scholarship_id = s.id) AS contents_count,
              (SELECT COUNT(*) FROM scholarship_faqs sf WHERE sf.scholarship_id = s.id) AS faqs_count
       FROM scholarships s 
       WHERE s.website = 'MYS' 
       ORDER BY s.id DESC`
    );

    const formatted = rows.map((r) => ({
      ...r,
      contents_count: Number(r.contents_count || 0),
      faqs_count: Number(r.faqs_count || 0),
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
    console.error('Error fetching scholarships:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch scholarships', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let slug = '';
    let active_status = '1';
    let type = '';
    let page_type = '';
    let landing_page_link = '';
    let shortnote = '';
    let meta_title = '';
    let meta_keyword = '';
    let meta_description = '';
    let page_content = '';
    let seo_rating = '';
    let best_rating = '';
    let review_number = '';
    let thumbnail_name = '';
    let thumbnail_path = '';
    let og_image_name = '';
    let og_image_path = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || '';
      slug = (formData.get('slug') as string) || '';
      active_status = (formData.get('active_status') as string) || '1';
      type = (formData.get('type') as string) || '';
      page_type = (formData.get('page_type') as string) || '';
      landing_page_link = (formData.get('landing_page_link') as string) || '';
      shortnote = (formData.get('shortnote') as string) || '';
      meta_title = (formData.get('meta_title') as string) || '';
      meta_keyword = (formData.get('meta_keyword') as string) || '';
      meta_description = (formData.get('meta_description') as string) || '';
      page_content = (formData.get('page_content') as string) || '';
      seo_rating = (formData.get('seo_rating') as string) || '';
      best_rating = (formData.get('best_rating') as string) || '';
      review_number = (formData.get('review_number') as string) || '';

      const thumbFile = formData.get('thumbnail') as File | null;
      if (thumbFile && typeof thumbFile === 'object' && thumbFile.name) {
        const buffer = Buffer.from(await thumbFile.arrayBuffer());
        const ext = path.extname(thumbFile.name);
        const baseName = path.basename(thumbFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_thumb_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'scholarship');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        thumbnail_name = fileName;
        thumbnail_path = `uploads/scholarship/${fileName}`;
      }

      const ogFile = formData.get('og_image') as File | null;
      if (ogFile && typeof ogFile === 'object' && ogFile.name) {
        const buffer = Buffer.from(await ogFile.arrayBuffer());
        const ext = path.extname(ogFile.name);
        const baseName = path.basename(ogFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_og_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'scholarship');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        og_image_name = fileName;
        og_image_path = `uploads/scholarship/${fileName}`;
      }
    } else {
      const body = await req.json();
      title = body.title || '';
      slug = body.slug || '';
      active_status = String(body.active_status ?? '1');
      type = body.type || '';
      page_type = body.page_type || '';
      landing_page_link = body.landing_page_link || '';
      shortnote = body.shortnote || '';
      meta_title = body.meta_title || '';
      meta_keyword = body.meta_keyword || '';
      meta_description = body.meta_description || '';
      page_content = body.page_content || '';
      seo_rating = body.seo_rating || '';
      best_rating = body.best_rating || '';
      review_number = body.review_number || '';
      thumbnail_path = body.thumbnail_path || '';
      og_image_path = body.og_image_path || '';
    }

    if (!title.trim()) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);

    await prisma.$executeRawUnsafe(
      `INSERT INTO scholarships (
        website, title, slug, active_status, type, page_type, landing_page_link,
        shortnote, thumbnail_name, thumbnail_path, og_image_name, og_image_path,
        meta_title, meta_keyword, meta_description, page_content, seo_rating, best_rating, review_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      'MYS',
      title,
      finalSlug,
      active_status,
      type,
      page_type,
      landing_page_link,
      shortnote,
      thumbnail_name,
      thumbnail_path,
      og_image_name,
      og_image_path,
      meta_title,
      meta_keyword,
      meta_description,
      page_content,
      seo_rating,
      best_rating,
      review_number
    );

    return NextResponse.json({
      status: true,
      message: 'Scholarship created successfully',
    });
  } catch (error: any) {
    console.error('Error creating scholarship:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create scholarship', error: error.message },
      { status: 500 }
    );
  }
}

