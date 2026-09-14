import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page_id = searchParams.get('page_id') || searchParams.get('service_id');

    let serviceInfo: any = null;
    let sql = `SELECT * FROM site_page_tabs`;
    const params: any[] = [];

    if (page_id) {
      const pId = parseInt(page_id, 10);
      sql += ` WHERE page_id = ?`;
      params.push(pId);

      const serviceRows: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM site_pages WHERE id = ? LIMIT 1`,
        pId
      );
      if (serviceRows && serviceRows.length > 0) {
        serviceInfo = serializeBigInt(serviceRows[0]);
      }
    }

    sql += ` ORDER BY id DESC`;

    const tabs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      service: serviceInfo,
      data: serializeBigInt(tabs),
    });
  } catch (error: any) {
    console.error('Error fetching service contents:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch service contents', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page_id, tab_title, tab_content, title, content } = body;

    const pageIdVal = page_id ? parseInt(page_id, 10) : null;
    const titleVal = tab_title || title || '';
    const contentVal = tab_content || content || '';

    if (!pageIdVal) {
      return NextResponse.json({ status: false, message: 'Service page ID is required' }, { status: 400 });
    }
    if (!titleVal) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO site_page_tabs (page_id, tab_title, tab_content, status, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      pageIdVal,
      titleVal,
      contentVal || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Service content created successfully' });
  } catch (error: any) {
    console.error('Error creating service content:', error);
    return NextResponse.json({ status: false, message: 'Failed to create service content', error: error.message }, { status: 500 });
  }
}

