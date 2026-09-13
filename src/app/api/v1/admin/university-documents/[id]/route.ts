import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = parseInt(id, 10);

    const [doc]: any[] = await prisma.$queryRawUnsafe(
      `SELECT d.*, u.name AS university_name, c.name AS category_name
       FROM university_documents d
       LEFT JOIN universities u ON d.university_id = u.id
       LEFT JOIN university_document_categories c ON d.category_id = c.id
       WHERE d.id = ?`,
      docId
    );

    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    let file_url = doc.file_path || '';
    if (file_url && !file_url.startsWith('http://') && !file_url.startsWith('https://')) {
      if (!file_url.startsWith('/')) {
        file_url = '/' + file_url;
      }
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt({ ...doc, file_url }),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch document', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = parseInt(id, 10);
    const contentType = request.headers.get('content-type') || '';

    let university_id: number;
    let category_id: number;
    let title: string;
    let description: string | null = null;
    let visibility: string = 'all';
    let status: number = 1;
    let replacementFile: File | null = null;
    let manualFilePath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      university_id = parseInt(formData.get('university_id') as string, 10);
      category_id = parseInt(formData.get('category_id') as string, 10);
      title = (formData.get('title') as string) || '';
      description = (formData.get('description') as string) || null;
      visibility = (formData.get('visibility') as string) || 'all';
      status = formData.get('status') === '0' || formData.get('status') === 'false' ? 0 : 1;

      const file = formData.get('document_file') as File | null;
      if (file && typeof file === 'object' && file.name) {
        replacementFile = file;
      }
      manualFilePath = (formData.get('file_path') as string) || null;
    } else {
      const body = await request.json();
      university_id = parseInt(body.university_id, 10);
      category_id = parseInt(body.category_id, 10);
      title = body.title || '';
      description = body.description || null;
      visibility = body.visibility || 'all';
      status = body.status !== undefined && body.status !== null ? (body.status ? 1 : 0) : 1;
      manualFilePath = body.file_path || null;
    }

    const [existingDoc]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_documents WHERE id = ?`,
      docId
    );

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    let filePath = existingDoc.file_path;
    let originalName = existingDoc.original_name;
    let extension = existingDoc.extension;
    let fileSize = existingDoc.file_size;
    let mimeType = existingDoc.mime_type;
    let storageDriver = existingDoc.storage_driver;

    if (replacementFile) {
      const [cat]: any[] = await prisma.$queryRawUnsafe(
        `SELECT slug FROM university_document_categories WHERE id = ?`,
        category_id
      );
      const categorySlug = cat?.slug || 'general';

      const buffer = Buffer.from(await replacementFile.arrayBuffer());
      originalName = replacementFile.name;
      const ext = path.extname(originalName);
      extension = ext.replace('.', '').toLowerCase();
      fileSize = replacementFile.size;
      mimeType = replacementFile.type || 'application/octet-stream';

      const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${Date.now()}_${baseName}${ext}`;

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'university_docs', String(university_id), categorySlug);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);

      filePath = `uploads/university_docs/${university_id}/${categorySlug}/${fileName}`;
      storageDriver = 'local';
    } else if (manualFilePath) {
      filePath = manualFilePath;
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        storageDriver = 'remote_ftp';
      }
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE university_documents
       SET university_id = ?,
           category_id = ?,
           title = ?,
           description = ?,
           file_path = ?,
           original_name = ?,
           extension = ?,
           file_size = ?,
           mime_type = ?,
           storage_driver = ?,
           visibility = ?,
           status = ?,
           updated_at = ?
       WHERE id = ?`,
      university_id,
      category_id,
      title || existingDoc.title,
      description,
      filePath,
      originalName,
      extension,
      fileSize,
      mimeType,
      storageDriver,
      visibility,
      status,
      now,
      docId
    );

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update document', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docId = parseInt(id, 10);

    await prisma.$executeRawUnsafe(
      `DELETE FROM university_documents WHERE id = ?`,
      docId
    );

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete document', error: error.message },
      { status: 500 }
    );
  }
}
