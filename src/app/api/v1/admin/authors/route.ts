import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const authors: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name FROM authors ORDER BY name ASC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(authors),
    });
  } catch (error: any) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ status: false, data: [] }, { status: 500 });
  }
}
