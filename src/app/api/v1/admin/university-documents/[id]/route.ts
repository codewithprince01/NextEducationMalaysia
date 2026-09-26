import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { uploadToRemoteStorage, deleteFromRemoteStorage, getRemoteFileUrl } from '@/lib/remoteStorage';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/fileStorage';
import { enqueueDocumentUpload } from '@/lib/documentUploadQueue';
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

    const file_url =
      doc.storage_driver === 'local'
        ? (doc.file_path.startsWith('/storage/')
            ? doc.file_path
            : `/storage/${doc.file_path.replace(/^\/+/, '')}`)
        : getRemoteFileUrl(doc.file_path);

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
    let visibility: string = 'admin_only';
    let status: number = 1;
    let replacementFile: File | null = null;
    let manualFilePath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      university_id = parseInt(formData.get('university_id') as string, 10);
      category_id = parseInt(formData.get('category_id') as string, 10);
      title = (formData.get('title') as string) || '';
      description = (formData.get('description') as string) || null;
      visibility = normalizeVisibility((formData.get('visibility') as string) || 'admin_only');
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
      visibility = normalizeVisibility(body.visibility || 'admin_only');
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

    let isLocalSaved = false;

    if (replacementFile) {
      // Delete old remote or local file
      if (existingDoc.file_path) {
        if (existingDoc.storage_driver === 'local') {
          await deleteUploadedFile(existingDoc.file_path);
        } else {
          await deleteFromRemoteStorage(existingDoc.file_path);
        }
      }

      const [cat]: any[] = await prisma.$queryRawUnsafe(
        `SELECT slug FROM university_document_categories WHERE id = ?`,
        category_id
      );
      const categorySlug = cat?.slug || 'general';

      const folder = `university_docs/${university_id}/${categorySlug}`;
      originalName = replacementFile.name;
      const ext = path.extname(originalName).replace('.', '').toLowerCase() || 'file';
      extension = ext;
      mimeType = replacementFile.type || 'application/octet-stream';
      fileSize = replacementFile.size;

      const localRes = await saveUploadedFile(replacementFile, originalName, folder);
      filePath = localRes.file_path;
      storageDriver = 'local';
      isLocalSaved = true;
    } else if (manualFilePath) {
      filePath = manualFilePath;
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

    if (isLocalSaved) {
      const [cat]: any[] = await prisma.$queryRawUnsafe(
        `SELECT slug FROM university_document_categories WHERE id = ?`,
        category_id
      );
      const categorySlug = cat?.slug || 'general';

      enqueueDocumentUpload({
        docId,
        universityId: university_id,
        categorySlug,
        relativePath: filePath,
        originalName,
        mimeType,
      });
    }

    const { recordAuditLog } = await import('@/lib/auditLogger');
    await recordAuditLog({
      req: request,
      action: 'UPDATE',
      module: 'university-documents',
      recordId: docId,
      description: `Updated document '${title || existingDoc.title}' (ID: ${docId})`,
      oldValues: existingDoc,
    });

    return NextResponse.json({
      success: true,
      message: 'Document updated instantly! Remote FTP sync running in background.',
    });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update document', error: error.message },
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

    const [existingDoc]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_documents WHERE id = ?`,
      docId
    );

    if (existingDoc && existingDoc.file_path) {
      await deleteFromRemoteStorage(existingDoc.file_path);
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM university_documents WHERE id = ?`,
      docId
    );

    const { recordAuditLog } = await import('@/lib/auditLogger');
    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'university-documents',
      recordId: docId,
      description: `Deleted document '${existingDoc?.title || existingDoc?.original_name || docId}' (ID: ${docId})`,
      oldValues: existingDoc,
    });

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

function normalizeVisibility(v: string | null | undefined): string {
  if (!v) return 'admin_only';
  const val = String(v).trim().toLowerCase();
  if (val === 'counsellor' || val === 'counsellors' || val === 'counsellors_only') {
    return 'counsellors_only';
  }
  if (val === 'agent' || val === 'agents' || val === 'agents_only') {
    return 'agents_only';
  }
  if (val === 'admin_only' || val === 'admin') {
    return 'admin_only';
  }
  if (val === 'all' || val === 'public') {
    return 'all';
  }
  return 'admin_only';
}

