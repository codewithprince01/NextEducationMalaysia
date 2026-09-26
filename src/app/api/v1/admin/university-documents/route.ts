import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";
import { uploadToRemoteStorage, getRemoteFileUrl } from "@/lib/remoteStorage";
import { saveUploadedFile } from "@/lib/fileStorage";
import { enqueueDocumentUpload, initQueueSweeper } from "@/lib/documentUploadQueue";
import path from "path";

export async function GET(request: Request) {
  try {
    initQueueSweeper();
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get("university_id");
    const category_id = searchParams.get("category_id");
    const file_type = searchParams.get("file_type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const offset = (page - 1) * limit;

    const whereConditions: string[] = ["1=1"];
    const params: any[] = [];

    if (university_id) {
      whereConditions.push("d.university_id = ?");
      params.push(parseInt(university_id, 10));
    }

    if (category_id) {
      whereConditions.push("d.category_id = ?");
      params.push(parseInt(category_id, 10));
    }

    if (file_type) {
      if (file_type === "image") {
        whereConditions.push(
          "LOWER(d.extension) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')",
        );
      } else if (file_type === "video") {
        whereConditions.push(
          "LOWER(d.extension) IN ('mp4', 'webm', 'mkv', 'avi', 'mov')",
        );
      } else if (file_type === "pdf") {
        whereConditions.push("LOWER(d.extension) = 'pdf'");
      }
    }

    if (search && search.trim()) {
      whereConditions.push(
        "(d.title LIKE ? OR d.original_name LIKE ? OR u.name LIKE ?)",
      );
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const whereClause = whereConditions.join(" AND ");

    // Total Count
    const [countResult]: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total
       FROM university_documents d
       LEFT JOIN universities u ON d.university_id = u.id
       WHERE ${whereClause}`,
      ...params,
    );

    const total = Number(countResult?.total || 0);

    // Fetch Rows
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT d.*,
              u.name AS university_name,
              c.name AS category_name,
              c.icon AS category_icon,
              c.slug AS category_slug,
              usr.name AS uploader_name
       FROM university_documents d
       LEFT JOIN universities u ON d.university_id = u.id
       LEFT JOIN university_document_categories c ON d.category_id = c.id
       LEFT JOIN users usr ON d.uploaded_by = usr.id
       WHERE ${whereClause}
       ORDER BY d.id DESC
       LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset,
    );

    // Summary Stats
    const [statsResult]: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) AS totalDocs,
        SUM(CASE WHEN LOWER(c.slug) = 'brochure' OR LOWER(c.name) LIKE '%brochure%' THEN 1 ELSE 0 END) AS brochuresCount,
        SUM(CASE WHEN LOWER(d.extension) IN ('mp4', 'webm', 'mkv', 'avi', 'mov') THEN 1 ELSE 0 END) AS videosCount,
        IFNULL(SUM(d.file_size), 0) AS totalSize
      FROM university_documents d
      LEFT JOIN university_document_categories c ON d.category_id = c.id
    `);

    // Fetch Universities for filter
    const universities: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name FROM universities ORDER BY name ASC`,
    );

    const filterUniversities: any[] = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT u.id, u.name 
       FROM universities u 
       INNER JOIN university_documents d ON d.university_id = u.id 
       ORDER BY u.name ASC`,
    );

    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, icon, slug FROM university_document_categories WHERE status = 1 ORDER BY position ASC`,
    );

    const processedRows = rows.map((doc) => {
      const ext = (doc.extension || "").toLowerCase();
      const is_image = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
      const is_video = ["mp4", "webm", "mkv", "avi", "mov"].includes(ext);
      const is_pdf = ext === "pdf";
      const file_url =
        doc.storage_driver === "local"
          ? (doc.file_path.startsWith("/storage/")
              ? doc.file_path
              : `/storage/${doc.file_path.replace(/^\/+/, "")}`)
          : getRemoteFileUrl(doc.file_path);

      return {
        ...doc,
        file_url,
        is_image,
        is_video,
        is_pdf,
        formatted_file_size: formatBytes(Number(doc.file_size || 0)),
      };
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt(processedRows),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalDocs: Number(statsResult?.totalDocs || 0),
        brochuresCount: Number(statsResult?.brochuresCount || 0),
        videosCount: Number(statsResult?.videosCount || 0),
        totalSize: Number(statsResult?.totalSize || 0),
        formattedTotalSize: formatBytes(Number(statsResult?.totalSize || 0)),
      },
      universities: serializeBigInt(universities),
      filterUniversities: serializeBigInt(filterUniversities),
      categories: serializeBigInt(categories),
    });
  } catch (error: any) {
    console.error("Error fetching university documents:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch university documents",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let university_id: number;
    let category_id: number;
    let title: string | null = null;
    let description: string | null = null;
    let visibility: string = "admin_only";
    let fileEntries: {
      buffer?: Buffer;
      original_name: string;
      mime_type?: string;
      file_size?: number;
      manualPath?: string;
    }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      university_id = parseInt(formData.get("university_id") as string, 10);
      category_id = parseInt(formData.get("category_id") as string, 10);
      title = (formData.get("title") as string) || null;
      description = (formData.get("description") as string) || null;
      visibility = (formData.get("visibility") as string) || "admin_only";

      const files = formData.getAll("documents") as (File | string)[];
      const singleFile = formData.get("document_file") as File | string | null;
      const allFiles = [...files, ...(singleFile ? [singleFile] : [])];

      for (const item of allFiles) {
        if (typeof item === "object" && item && item.name) {
          const buffer = Buffer.from(await item.arrayBuffer());
          fileEntries.push({
            buffer,
            original_name: item.name,
            mime_type: item.type || "application/octet-stream",
            file_size: item.size,
          });
        } else if (typeof item === "string" && item.trim()) {
          fileEntries.push({
            original_name: path.basename(item),
            manualPath: item.trim(),
          });
        }
      }

      const manualFilePath = formData.get("file_path") as string | null;
      if (manualFilePath && fileEntries.length === 0) {
        fileEntries.push({
          original_name: path.basename(manualFilePath),
          manualPath: manualFilePath.trim(),
        });
      }
    } else {
      const body = await request.json();
      university_id = parseInt(body.university_id, 10);
      category_id = parseInt(body.category_id, 10);
      title = body.title || null;
      description = body.description || null;
      visibility = body.visibility || "admin_only";

      if (body.file_path) {
        fileEntries.push({
          original_name: body.original_name || path.basename(body.file_path),
          manualPath: body.file_path,
          mime_type: body.mime_type,
          file_size: body.file_size,
        });
      }
    }

    if (!university_id || isNaN(university_id)) {
      return NextResponse.json(
        { success: false, message: "Select a valid university" },
        { status: 400 },
      );
    }

    if (!category_id || isNaN(category_id)) {
      return NextResponse.json(
        { success: false, message: "Select a valid document category" },
        { status: 400 },
      );
    }

    if (fileEntries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select or provide at least one document file",
        },
        { status: 400 },
      );
    }

    // Get category slug
    const [cat]: any[] = await prisma.$queryRawUnsafe(
      `SELECT slug FROM university_document_categories WHERE id = ?`,
      category_id,
    );
    const categorySlug = cat?.slug || "general";

    const now = new Date();
    let uploadedCount = 0;

    for (const entry of fileEntries) {
      let finalFilePath = "";
      let originalName = entry.original_name || "document";
      let extension =
        path.extname(originalName).replace(".", "").toLowerCase() || "file";
      let fileSize = entry.file_size || 0;
      let mimeType = entry.mime_type || "application/octet-stream";
      let storageDriver = "remote_ftp";

      let isLocalSaved = false;

      if (entry.buffer) {
        const folder = `university_docs/${university_id}/${categorySlug}`;
        const blob = new Blob([new Uint8Array(entry.buffer)]);
        const localRes = await saveUploadedFile(blob, originalName, folder);
        finalFilePath = localRes.file_path;
        storageDriver = "local";
        isLocalSaved = true;
      } else if (entry.manualPath) {
        finalFilePath = entry.manualPath;
      }

      let docTitle = title;
      if (!docTitle || fileEntries.length > 1) {
        docTitle = path.basename(originalName, path.extname(originalName));
        docTitle = docTitle
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      await prisma.$executeRawUnsafe(
        `INSERT INTO university_documents 
          (university_id, category_id, title, description, file_path, original_name, extension, file_size, mime_type, storage_driver, visibility, uploaded_by, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        university_id,
        category_id,
        docTitle,
        description,
        finalFilePath,
        originalName,
        extension,
        fileSize,
        mimeType,
        storageDriver,
        visibility,
        null,
        1,
        now,
        now,
      );

      // Get inserted ID to enqueue background FTP sync
      const [newRow]: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM university_documents WHERE university_id = ? ORDER BY id DESC LIMIT 1`,
        university_id,
      );
      const docId = Number(newRow?.id);

      if (isLocalSaved && docId) {
        enqueueDocumentUpload({
          docId,
          universityId: university_id,
          categorySlug,
          relativePath: finalFilePath,
          originalName,
          mimeType,
        });
      }

      uploadedCount++;
    }

    const { recordAuditLog } = await import('@/lib/auditLogger');
    await recordAuditLog({
      req: request,
      action: 'CREATE',
      module: 'university-documents',
      description: `Uploaded ${uploadedCount} document(s) for University #${university_id}`,
    });

    return NextResponse.json({
      success: true,
      message: `${uploadedCount} document record(s) created instantly! Remote FTP upload running in background.`,
    });
  } catch (error: any) {
    console.error("Error uploading university documents:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload document",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
  return bytes + " bytes";
}

