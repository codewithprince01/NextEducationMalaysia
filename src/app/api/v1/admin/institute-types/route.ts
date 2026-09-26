import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET(req: Request) {
  try {
    const types: any[] = await prisma.$queryRawUnsafe(
      `SELECT it.*, COALESCE(u.cnt, 0) AS university_count
       FROM institute_types it
       LEFT JOIN (SELECT institute_type, COUNT(*) as cnt FROM universities GROUP BY institute_type) u ON u.institute_type = it.id
       WHERE it.website = 'MYS'
       ORDER BY it.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(types),
    });
  } catch (error: any) {
    console.error('Error fetching institute types:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch institute types', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, seo_title } = body;

    if (!type) {
      return NextResponse.json({ status: false, message: 'Institute type name is required' }, { status: 400 });
    }

    const slug = slugify(type);
    const seoTitle = seo_title || type;
    const seoTitleSlug = slugify(seoTitle);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO institute_types (website, type, slug, seo_title, seo_title_slug, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?)`,
      type,
      slug,
      seoTitle,
      seoTitleSlug,
      now,
      now
    );

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'institute-types',
      description: `Created institute type '${type}'`,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Institute type created successfully' });
  } catch (error: any) {
    console.error('Error creating institute type:', error);
    return NextResponse.json({ status: false, message: 'Failed to create institute type', error: error.message }, { status: 500 });
  }
}

