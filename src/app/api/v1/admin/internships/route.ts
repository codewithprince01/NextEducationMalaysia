import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(req: Request) {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT i.*,
        COALESCE(ic.cnt, 0) as contents_count,
        COALESCE(ifq.cnt, 0) as faqs_count
       FROM internships i 
       LEFT JOIN (SELECT internship_id, COUNT(*) as cnt FROM internship_contents GROUP BY internship_id) ic ON ic.internship_id = i.id
       LEFT JOIN (SELECT internship_id, COUNT(*) as cnt FROM internship_faqs GROUP BY internship_id) ifq ON ifq.internship_id = i.id
       ORDER BY i.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch internships', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      active_status,
      thumbnail_path,
      thumbnail_name,
      shortnote,
      website = 'MYS',
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating,
      best_rating,
      review_number,
      og_image_name,
      og_image_path,
    } = body;

    if (!title) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const slugified = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO internships (
        title, slug, active_status, thumbnail_name, thumbnail_path, shortnote, website,
        meta_title, meta_keyword, meta_description, seo_rating, best_rating, review_number,
        og_image_name, og_image_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      title,
      slugified,
      active_status || 'LIVE',
      thumbnail_name || null,
      thumbnail_path || null,
      shortnote || null,
      website,
      meta_title || null,
      meta_keyword || null,
      meta_description || null,
      seo_rating ? parseFloat(seo_rating) : null,
      best_rating ? parseFloat(best_rating) : null,
      review_number ? parseInt(review_number, 10) : null,
      og_image_name || null,
      og_image_path || null,
      now,
      now
    );

    const [lastInsert]: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const newId = lastInsert?.id ? Number(lastInsert.id) : undefined;

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'internships',
      recordId: newId,
      description: `Created internship '${title}'`,
      newValues: { title, slug: slugified, active_status },
    });

    return NextResponse.json({ status: true, message: 'Internship program created successfully' });
  } catch (error: any) {
    console.error('Error creating internship program:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create internship program', error: error.message },
      { status: 500 }
    );
  }
}

