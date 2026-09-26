import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM static_page_contents ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching static_page_contents:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch static page contents', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page_name, title, position, author_id, heading, description } = body;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO static_page_contents (website, page_name, title, position, author_id, heading, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      'MYS',
      page_name || 'University Page Content',
      title || 'University Page Content',
      position || null,
      author_id ? parseInt(author_id, 10) : null,
      heading || null,
      description || null,
      now,
      now
    );

    const [lastInsert]: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const newId = lastInsert?.id ? Number(lastInsert.id) : undefined;

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'static-page-contents',
      recordId: newId,
      description: `Created static page content '${title || page_name}'`,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Static page content created successfully' });
  } catch (error: any) {
    console.error('Error creating static_page_content:', error);
    return NextResponse.json({ status: false, message: 'Failed to create static page content', error: error.message }, { status: 500 });
  }
}

