import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const authors: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM authors ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(authors),
    });
  } catch (error: any) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch authors', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, designation, bio, profile_image } = body;

    if (!name) {
      return NextResponse.json({ status: false, message: 'Author name is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO authors (name, email, designation, bio, profile_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      name,
      email || null,
      designation || null,
      bio || null,
      profile_image || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Author created successfully' });
  } catch (error: any) {
    console.error('Error creating author:', error);
    return NextResponse.json({ status: false, message: 'Failed to create author', error: error.message }, { status: 500 });
  }
}
