import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
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
      `SELECT e.*, e.page_name AS name, e.imgpath AS thumbnail_path, e.og_image AS og_image_path FROM exams e WHERE e.id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const row = rows[0];
    row.thumbnail_path = row.imgpath
      ? row.imgpath.startsWith('/')
        ? row.imgpath
        : `/${row.imgpath}`
      : '';
    row.og_image_path = row.og_image
      ? row.og_image.startsWith('/')
        ? row.og_image
        : `/${row.og_image}`
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
      `SELECT * FROM exams WHERE id = ? LIMIT 1`,
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const existing = existingRows[0];
    const contentType = req.headers.get('content-type') || '';

    let page_name = existing.page_name || '';
    let headline = existing.headline || '';
    let description = existing.description || '';
    let position = existing.position || 1;
    let meta_title = existing.meta_title || '';
    let meta_keyword = existing.meta_keyword || '';
    let meta_description = existing.meta_description || '';
    let seo_rating = existing.seo_rating || '';
    let best_rating = existing.best_rating || '';
    let review_number = existing.review_number || '';
    let imgname = existing.imgname || '';
    let imgpath = existing.imgpath || '';
    let og_image = existing.og_image || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('page_name')) page_name = (formData.get('page_name') as string) || '';
      if (formData.has('name') && !page_name) page_name = (formData.get('name') as string) || '';
      if (formData.has('headline')) headline = (formData.get('headline') as string) || '';
      if (formData.has('title') && !headline) headline = (formData.get('title') as string) || '';
      if (formData.has('description')) description = (formData.get('description') as string) || '';
      if (formData.has('position')) position = (formData.get('position') as string) || '1';
      if (formData.has('meta_title')) meta_title = (formData.get('meta_title') as string) || '';
      if (formData.has('meta_keyword')) meta_keyword = (formData.get('meta_keyword') as string) || '';
      if (formData.has('meta_description')) meta_description = (formData.get('meta_description') as string) || '';
      if (formData.has('seo_rating')) seo_rating = (formData.get('seo_rating') as string) || '';
      if (formData.has('best_rating')) best_rating = (formData.get('best_rating') as string) || '';
      if (formData.has('review_number')) review_number = (formData.get('review_number') as string) || '';

      const thumbFile = formData.get('thumbnail') as File | null;
      if (thumbFile && typeof thumbFile === 'object' && thumbFile.name) {
        const buffer = Buffer.from(await thumbFile.arrayBuffer());
        const ext = path.extname(thumbFile.name);
        const baseName = path.basename(thumbFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_thumb_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'exams');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        imgname = fileName;
        imgpath = `uploads/exams/${fileName}`;
      }

      const ogFile = formData.get('og_image') as File | null;
      if (ogFile && typeof ogFile === 'object' && ogFile.name) {
        const buffer = Buffer.from(await ogFile.arrayBuffer());
        const ext = path.extname(ogFile.name);
        const baseName = path.basename(ogFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${Date.now()}_og_${baseName}${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'exams');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        og_image = `uploads/exams/${fileName}`;
      }
    } else {
      const body = await req.json();
      if (body.page_name !== undefined) page_name = body.page_name;
      if (body.name !== undefined && !page_name) page_name = body.name;
      if (body.headline !== undefined) headline = body.headline;
      if (body.title !== undefined && !headline) headline = body.title;
      if (body.description !== undefined) description = body.description;
      if (body.position !== undefined) position = body.position;
      if (body.meta_title !== undefined) meta_title = body.meta_title;
      if (body.meta_keyword !== undefined) meta_keyword = body.meta_keyword;
      if (body.meta_description !== undefined) meta_description = body.meta_description;
      if (body.seo_rating !== undefined) seo_rating = body.seo_rating;
      if (body.best_rating !== undefined) best_rating = body.best_rating;
      if (body.review_number !== undefined) review_number = body.review_number;
    }

    const uri = slugify(page_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE exams SET
        page_name = ?, uri = ?, headline = ?, position = ?, description = ?,
        imgname = ?, imgpath = ?, og_image = ?,
        meta_title = ?, meta_keyword = ?, meta_description = ?,
        seo_rating = ?, best_rating = ?, review_number = ?, updated_at = ?
       WHERE id = ?`,
      page_name,
      uri,
      headline,
      parseInt(String(position), 10) || 1,
      description,
      imgname,
      imgpath,
      og_image,
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating,
      best_rating,
      review_number,
      now,
      id
    );

    return NextResponse.json({
      status: true,
      message: 'Exam updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating exam:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update exam', error: error.message },
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
      `SELECT * FROM exams WHERE id = ? LIMIT 1`,
      id
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    const row = existingRows[0];
    if (row.imgpath) {
      const fullPath = path.join(process.cwd(), 'public', row.imgpath.replace(/^\//, ''));
      await unlink(fullPath).catch(() => {});
    }
    if (row.og_image) {
      const fullPath = path.join(process.cwd(), 'public', row.og_image.replace(/^\//, ''));
      await unlink(fullPath).catch(() => {});
    }

    await prisma.$executeRawUnsafe(`DELETE FROM exams WHERE id = ?`, id);

    return NextResponse.json({
      status: true,
      message: 'Exam deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete exam', error: error.message },
      { status: 500 }
    );
  }
}
