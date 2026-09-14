import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_banners WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const row = rows[0];
    row.banner_path = row.banner_path
      ? row.banner_path.startsWith('/')
        ? row.banner_path
        : `/${row.banner_path}`
      : '';

    return NextResponse.json({
      status: true,
      data: serializeBigInt(row),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to fetch record', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_banners WHERE id = ? LIMIT 1`,
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const existing = existingRows[0];
    const contentType = req.headers.get('content-type') || '';

    let page = existing.page || 'home';
    let alt_text = existing.alt_text || '';
    let title = existing.title || '';
    let description = existing.description || '';
    let banner_name = existing.banner_name || '';
    let banner_path = existing.banner_path || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('page')) page = (formData.get('page') as string) || 'home';
      if (formData.has('alt_text')) alt_text = (formData.get('alt_text') as string) || '';
      if (formData.has('title')) title = (formData.get('title') as string) || '';
      if (formData.has('description')) description = (formData.get('description') as string) || '';

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
      if (body.page !== undefined) page = body.page;
      if (body.alt_text !== undefined) alt_text = body.alt_text;
      if (body.title !== undefined) title = body.title;
      if (body.description !== undefined) description = body.description;
      if (body.banner_path !== undefined) banner_path = body.banner_path;
    }

    await prisma.$executeRawUnsafe(
      `UPDATE page_banners SET page = ?, alt_text = ?, title = ?, description = ?, banner_name = ?, banner_path = ? WHERE id = ?`,
      page,
      alt_text,
      title,
      description,
      banner_name,
      banner_path,
      id
    );

    return NextResponse.json({
      status: true,
      message: 'Page banner updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating page banner:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update page banner', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM page_banners WHERE id = ? LIMIT 1`,
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const row = existingRows[0];
    if (row.banner_path) {
      const fullPath = path.join(process.cwd(), 'public', row.banner_path.replace(/^\//, ''));
      await unlink(fullPath).catch(() => {});
    }

    await prisma.$executeRawUnsafe(`DELETE FROM page_banners WHERE id = ?`, id);

    return NextResponse.json({
      status: true,
      message: 'Page banner deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting page banner:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete page banner', error: error.message },
      { status: 500 }
    );
  }
}

