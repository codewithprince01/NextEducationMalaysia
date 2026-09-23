import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt, slugify } from "@/lib/utils";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/fileStorage";
import { recordAuditLog } from "@/lib/auditLogger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM scholarships WHERE id = ? LIMIT 1`,
      id,
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { status: false, message: "Record not found" },
        { status: 404 },
      );
    }

    const row = rows[0];
    row.thumbnail_path = row.thumbnail_path
      ? row.thumbnail_path.startsWith("/")
        ? row.thumbnail_path
        : `/${row.thumbnail_path}`
      : "";
    row.og_image_path = row.og_image_path
      ? row.og_image_path.startsWith("/")
        ? row.og_image_path
        : `/${row.og_image_path}`
      : "";

    return NextResponse.json({
      status: true,
      data: serializeBigInt(row),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch record",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM scholarships WHERE id = ? LIMIT 1`,
      id,
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { status: false, message: "Record not found" },
        { status: 404 },
      );
    }

    const existing = existingRows[0];
    const contentType = req.headers.get("content-type") || "";

    let title = existing.title;
    let slug = existing.slug;
    let active_status = existing.active_status;
    let type = existing.type;
    let page_type = existing.page_type;
    let landing_page_link = existing.landing_page_link;
    let shortnote = existing.shortnote;
    let meta_title = existing.meta_title;
    let meta_keyword = existing.meta_keyword;
    let meta_description = existing.meta_description;
    let page_content = existing.page_content;
    let seo_rating = existing.seo_rating;
    let best_rating = existing.best_rating;
    let review_number = existing.review_number;
    let thumbnail_name = existing.thumbnail_name || "";
    let thumbnail_path = existing.thumbnail_path || "";
    let og_image_name = existing.og_image_name || "";
    let og_image_path = existing.og_image_path || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      if (formData.has("title"))
        title = (formData.get("title") as string) || "";
      if (formData.has("slug")) slug = (formData.get("slug") as string) || "";
      if (formData.has("active_status"))
        active_status = (formData.get("active_status") as string) || "1";
      if (formData.has("type")) type = (formData.get("type") as string) || "";
      if (formData.has("page_type"))
        page_type = (formData.get("page_type") as string) || "";
      if (formData.has("landing_page_link"))
        landing_page_link = (formData.get("landing_page_link") as string) || "";
      if (formData.has("shortnote"))
        shortnote = (formData.get("shortnote") as string) || "";
      if (formData.has("meta_title"))
        meta_title = (formData.get("meta_title") as string) || "";
      if (formData.has("meta_keyword"))
        meta_keyword = (formData.get("meta_keyword") as string) || "";
      if (formData.has("meta_description"))
        meta_description = (formData.get("meta_description") as string) || "";
      if (formData.has("page_content"))
        page_content = (formData.get("page_content") as string) || "";
      if (formData.has("seo_rating"))
        seo_rating = (formData.get("seo_rating") as string) || "";
      if (formData.has("best_rating"))
        best_rating = (formData.get("best_rating") as string) || "";
      if (formData.has("review_number"))
        review_number = (formData.get("review_number") as string) || "";

      const thumbFile = formData.get("thumbnail") as File | null;
      if (thumbFile && typeof thumbFile === "object" && thumbFile.name) {
        const saved = await saveUploadedFile(
          thumbFile,
          thumbFile.name,
          "scholarship",
          existing.thumbnail_path,
        );
        thumbnail_name = saved.file_name;
        thumbnail_path = saved.file_path;
      }

      const ogFile = formData.get("og_image") as File | null;
      if (ogFile && typeof ogFile === "object" && ogFile.name) {
        const savedOg = await saveUploadedFile(
          ogFile,
          ogFile.name,
          "scholarship",
          existing.og_image_path,
        );
        og_image_name = savedOg.file_name;
        og_image_path = savedOg.file_path;
      }
    } else {
      const body = await req.json();
      if (body.title !== undefined) title = body.title;
      if (body.slug !== undefined) slug = body.slug;
      if (body.active_status !== undefined)
        active_status = String(body.active_status);
      if (body.type !== undefined) type = body.type;
      if (body.page_type !== undefined) page_type = body.page_type;
      if (body.landing_page_link !== undefined)
        landing_page_link = body.landing_page_link;
      if (body.shortnote !== undefined) shortnote = body.shortnote;
      if (body.meta_title !== undefined) meta_title = body.meta_title;
      if (body.meta_keyword !== undefined) meta_keyword = body.meta_keyword;
      if (body.meta_description !== undefined)
        meta_description = body.meta_description;
      if (body.page_content !== undefined) page_content = body.page_content;
      if (body.seo_rating !== undefined) seo_rating = body.seo_rating;
      if (body.best_rating !== undefined) best_rating = body.best_rating;
      if (body.review_number !== undefined) review_number = body.review_number;
      if (body.thumbnail_path !== undefined)
        thumbnail_path = body.thumbnail_path;
      if (body.og_image_path !== undefined) og_image_path = body.og_image_path;
    }

    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);

    await prisma.$executeRawUnsafe(
      `UPDATE scholarships SET 
        title = ?, slug = ?, active_status = ?, type = ?, page_type = ?, landing_page_link = ?,
        shortnote = ?, thumbnail_name = ?, thumbnail_path = ?, og_image_name = ?, og_image_path = ?,
        meta_title = ?, meta_keyword = ?, meta_description = ?, page_content = ?,
        seo_rating = ?, best_rating = ?, review_number = ?
       WHERE id = ?`,
      title,
      finalSlug,
      parseInt(String(active_status), 10) || 1,
      type,
      page_type,
      landing_page_link,
      shortnote,
      thumbnail_name,
      thumbnail_path,
      og_image_name,
      og_image_path,
      meta_title,
      meta_keyword,
      meta_description,
      page_content,
      seo_rating ? parseFloat(String(seo_rating)) : null,
      best_rating ? parseFloat(String(best_rating)) : null,
      review_number ? parseInt(String(review_number), 10) : null,
      id,
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'scholarships',
      recordId: id,
      description: `Updated scholarship '${title || existing.title || id}' (ID: ${id})`,
      oldValues: existing,
      newValues: { title, slug: finalSlug, active_status, type, page_type },
    });

    return NextResponse.json({
      status: true,
      message: "Scholarship updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating scholarship:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to update scholarship",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM scholarships WHERE id = ? LIMIT 1`,
      id,
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { status: false, message: "Record not found" },
        { status: 404 },
      );
    }

    const row = existingRows[0];
    if (row.thumbnail_path) {
      await deleteUploadedFile(row.thumbnail_path);
    }
    if (row.og_image_path) {
      await deleteUploadedFile(row.og_image_path);
    }

    await prisma.$executeRawUnsafe(`DELETE FROM scholarships WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'scholarships',
      recordId: id,
      description: `Deleted scholarship '${row.title || id}' (ID: ${id})`,
      oldValues: row,
    });

    return NextResponse.json({
      status: true,
      message: "Scholarship deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting scholarship:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to delete scholarship",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
