import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/fileStorage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM landing_pages WHERE id = ? LIMIT 1`,
      id
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: false, message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows[0]),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch record', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const contentType = req.headers.get('content-type') || '';
    let page_name = '';
    let page_slug = '';
    let date_and_address = '';
    let date_and_address_image_path = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      page_name = (formData.get('page_name') as string) || '';
      page_slug = (formData.get('page_slug') as string) || '';
      date_and_address = (formData.get('date_and_address') as string) || '';
      const file = formData.get('date_and_address_image') as File | null;

      if (file && typeof file === 'object' && file.name) {
        const saved = await saveUploadedFile(file, file.name, 'landingpage');
        date_and_address_image_path = saved.file_path;
      }
    } else {
      const body = await req.json();
      page_name = body.page_name || '';
      page_slug = body.page_slug || '';
      date_and_address = body.date_and_address || '';
      date_and_address_image_path = body.date_and_address_image || '';
    }

    if (!page_name) {
      return NextResponse.json({ status: false, message: 'Page name is required' }, { status: 400 });
    }

    const slugVal = page_slug ? slugify(page_slug) : slugify(page_name);
    const now = new Date();

    if (date_and_address_image_path) {
      await prisma.$executeRawUnsafe(
        `UPDATE landing_pages 
         SET page_name = ?, page_slug = ?, date_and_address = ?, date_and_address_image = ?, updated_at = ?
         WHERE id = ?`,
        page_name,
        slugVal,
        date_and_address || null,
        date_and_address_image_path,
        now,
        id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE landing_pages 
         SET page_name = ?, page_slug = ?, date_and_address = ?, updated_at = ?
         WHERE id = ?`,
        page_name,
        slugVal,
        date_and_address || null,
        now,
        id
      );
    }

    return NextResponse.json({ status: true, message: 'Record has been updated successfully.' });
  } catch (error: any) {
    console.error('Error updating landing_page:', error);
    return NextResponse.json({ status: false, message: 'Failed to update record', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(`SELECT date_and_address_image FROM landing_pages WHERE id = ?`, id);
    if (rows.length > 0 && rows[0].date_and_address_image) {
      await deleteUploadedFile(rows[0].date_and_address_image);
    }
    await prisma.$executeRawUnsafe(`DELETE FROM landing_pages WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting landing_page:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete record', error: error.message }, { status: 500 });
  }
}
