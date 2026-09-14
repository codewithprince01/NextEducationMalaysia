import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { getRemoteFileUrl } from '@/lib/remoteStorage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const docId = parseInt(rawId, 10);

    if (isNaN(docId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT d.*,
              u.name AS university_name,
              u.uname AS university_slug,
              u.logo_path AS university_logo,
              c.name AS category_name,
              c.slug AS category_slug,
              c.icon AS category_icon,
              c.description AS category_description
       FROM university_documents d
       LEFT JOIN universities u ON d.university_id = u.id
       LEFT JOIN university_document_categories c ON d.category_id = c.id
       WHERE d.id = ? AND d.status = 1
       LIMIT 1`,
      docId
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      );
    }

    const doc = rows[0];

    // Increment downloads count asynchronously
    await prisma.$executeRawUnsafe(
      `UPDATE university_documents SET downloads_count = downloads_count + 1 WHERE id = ?`,
      docId
    );

    const ext = (doc.extension || '').toLowerCase();
    const is_image = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
    const is_video = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(ext);
    const is_pdf = ext === 'pdf';
    const file_url = getRemoteFileUrl(doc.file_path);

    const documentData = {
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      file_path: doc.file_path,
      file_url,
      original_name: doc.original_name,
      extension: doc.extension,
      file_size: Number(doc.file_size || 0),
      formatted_file_size: formatBytes(Number(doc.file_size || 0)),
      mime_type: doc.mime_type || '',
      storage_driver: doc.storage_driver || 'remote_ftp',
      visibility: doc.visibility,
      downloads_count: Number(doc.downloads_count || 0) + 1,
      status: doc.status,
      created_at: doc.created_at,
      is_image,
      is_video,
      is_pdf,
      university: {
        id: doc.university_id,
        name: doc.university_name || 'N/A',
        slug: doc.university_slug || '',
        logo_path: doc.university_logo ? (doc.university_logo.startsWith('http') ? doc.university_logo : `/${doc.university_logo}`) : '',
      },
      category: {
        id: doc.category_id,
        name: doc.category_name || 'Uncategorized',
        slug: doc.category_slug || '',
        icon: doc.category_icon || 'ri-folder-line',
        description: doc.category_description || '',
      },
    };

    return NextResponse.json({
      success: true,
      message: 'Document fetched successfully',
      data: serializeBigInt(documentData),
    });
  } catch (error: any) {
    console.error('Error fetching single university document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch document', error: error.message },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' bytes';
}

