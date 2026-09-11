import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const seos: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM static_page_seos ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(seos),
    });
  } catch (error: any) {
    console.error('Error fetching static page SEOs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch static page SEOs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page, meta_title, meta_description, meta_keyword, og_image_path } = body;

    if (!page) {
      return NextResponse.json({ status: false, message: 'Page name is required' }, { status: 400 });
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM static_page_seos`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO static_page_seos (id, website, page, meta_title, meta_description, meta_keyword, og_image_path, created_at, updated_at)
       VALUES (?, 'MYS', ?, ?, ?, ?, ?, ?, ?)`,
      nextId,
      page,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Static page SEO created successfully' });
  } catch (error: any) {
    console.error('Error creating static page SEO:', error);
    return NextResponse.json({ status: false, message: 'Failed to create static page SEO', error: error.message }, { status: 500 });
  }
}
