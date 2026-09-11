import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const services: any[] = await prisma.$queryRawUnsafe(
      `SELECT s.*, s.headline AS title, s.slug AS uri FROM services s ORDER BY s.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(services),
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch services', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, uri, shortnote, thumbnail_path, meta_title, meta_description, meta_keyword, og_image_path, banner_path } = body;

    if (!title) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const slug = uri || slugify(title);
    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM services`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO services (id, website, headline, slug, description, meta_title, meta_description, meta_keyword, status, created_at, updated_at)
       VALUES (?, 'MYS', ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      nextId,
      title,
      slug,
      shortnote || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Service created successfully' });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ status: false, message: 'Failed to create service', error: error.message }, { status: 500 });
  }
}
