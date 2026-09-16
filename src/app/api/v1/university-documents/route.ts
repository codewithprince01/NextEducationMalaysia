import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';
import { getRemoteFileUrl } from '@/lib/remoteStorage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');
    const university_slug = searchParams.get('university_slug');
    const category_id = searchParams.get('category_id');
    const category_slug = searchParams.get('category_slug');
    const file_type = searchParams.get('file_type');
    const visibility = searchParams.get('visibility');
    const search = searchParams.get('search');
    const group_by = searchParams.get('group_by');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const offset = (page - 1) * limit;

    const whereConditions: string[] = ['d.status = 1'];
    const params: any[] = [];

    // Filter by University ID or Slug
    if (university_id) {
      whereConditions.push('d.university_id = ?');
      params.push(parseInt(university_id, 10));
    } else if (university_slug) {
      whereConditions.push('u.uname = ?');
      params.push(university_slug);
    }

    // Filter by Category ID or Slug
    if (category_id) {
      whereConditions.push('d.category_id = ?');
      params.push(parseInt(category_id, 10));
    } else if (category_slug) {
      whereConditions.push('c.slug = ?');
      params.push(category_slug);
    }

    // Filter by File Format
    if (file_type) {
      if (file_type === 'image') {
        whereConditions.push("LOWER(d.extension) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')");
      } else if (file_type === 'video') {
        whereConditions.push("LOWER(d.extension) IN ('mp4', 'webm', 'mkv', 'avi', 'mov')");
      } else if (file_type === 'pdf') {
        whereConditions.push("LOWER(d.extension) = 'pdf'");
      }
    }

    // Filter by Visibility if explicitly passed, otherwise show all data (public and admin only both)
    if (visibility === 'all') {
      whereConditions.push("d.visibility = 'all'");
    } else if (visibility === 'agents_only') {
      whereConditions.push("d.visibility = 'agents_only'");
    } else if (visibility === 'counsellors_only') {
      whereConditions.push("d.visibility = 'counsellors_only'");
    } else if (visibility === 'admin_only') {
      whereConditions.push("d.visibility = 'admin_only'");
    }

    // Search query keyword
    if (search && search.trim()) {
      whereConditions.push('(d.title LIKE ? OR d.original_name LIKE ? OR u.name LIKE ? OR d.description LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    const whereClause = whereConditions.join(' AND ');

    // Total Count
    const [countResult]: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total
       FROM university_documents d
       LEFT JOIN universities u ON d.university_id = u.id
       LEFT JOIN university_document_categories c ON d.category_id = c.id
       WHERE ${whereClause}`,
      ...params
    );
    const total = Number(countResult?.total || 0);

    // Fetch Document Rows
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
       WHERE ${whereClause}
       ORDER BY c.position ASC, d.id DESC
       LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );

    // Process Documents with full file_url and attributes
    const documents = rows.map((doc) => {
      const ext = (doc.extension || '').toLowerCase();
      const is_image = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
      const is_video = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(ext);
      const is_pdf = ext === 'pdf';
      const file_url = getRemoteFileUrl(doc.file_path);

      return {
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
        downloads_count: Number(doc.downloads_count || 0),
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
    });

    // Option: Group by category
    let groupedByCategory: any[] = [];
    if (group_by === 'category') {
      const categoryMap = new Map<number, { category: any; documents: any[] }>();

      documents.forEach((doc) => {
        const catId = doc.category.id || 0;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            category: doc.category,
            documents: [],
          });
        }
        categoryMap.get(catId)!.documents.push(doc);
      });

      groupedByCategory = Array.from(categoryMap.values());
    }

    // Filter Options: Active Universities with Documents
    const universities: any[] = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT u.id, u.name, u.uname
       FROM universities u
       INNER JOIN university_documents d ON d.university_id = u.id
       WHERE d.status = 1
       ORDER BY u.name ASC`
    );

    // Filter Options: Active Categories with Documents Count
    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT c.id, c.name, c.slug, c.icon,
              COUNT(d.id) AS documents_count
       FROM university_document_categories c
       LEFT JOIN university_documents d ON d.category_id = c.id AND d.status = 1
       WHERE c.status = 1
       GROUP BY c.id, c.name, c.slug, c.icon
       ORDER BY c.position ASC`
    );

    // Calculate Summary Stats
    const [statsResult]: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) AS totalDocs,
        SUM(CASE WHEN LOWER(c.slug) = 'brochure' OR LOWER(c.name) LIKE '%brochure%' THEN 1 ELSE 0 END) AS brochuresCount,
        SUM(CASE WHEN LOWER(d.extension) IN ('mp4', 'webm', 'mkv', 'avi', 'mov') THEN 1 ELSE 0 END) AS videosCount,
        IFNULL(SUM(d.file_size), 0) AS totalSize
      FROM university_documents d
      LEFT JOIN university_document_categories c ON d.category_id = c.id
      WHERE d.status = 1
    `);

    return NextResponse.json({
      success: true,
      message: 'University documents fetched successfully',
      data: serializeBigInt(documents),
      ...(group_by === 'category' ? { grouped_by_category: serializeBigInt(groupedByCategory) } : {}),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total_documents: Number(statsResult?.totalDocs || 0),
        brochures_count: Number(statsResult?.brochuresCount || 0),
        videos_count: Number(statsResult?.videosCount || 0),
        total_storage_size: Number(statsResult?.totalSize || 0),
        formatted_total_size: formatBytes(Number(statsResult?.totalSize || 0)),
      },
      filters: {
        universities: serializeBigInt(universities),
        categories: serializeBigInt(
          categories.map((c) => ({ ...c, documents_count: Number(c.documents_count || 0) }))
        ),
      },
    });
  } catch (error: any) {
    console.error('Error fetching public university documents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch university documents', error: error.message },
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

