import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt, slugify } from "@/lib/utils";
import { saveUploadedFile } from "@/lib/fileStorage";
import { recordAuditLog } from "@/lib/auditLogger";

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT e.*,
              e.page_name AS name,
              e.headline AS headline,
              e.imgpath AS thumbnail_path,
              e.og_image AS og_image_path
       FROM exams e 
       WHERE e.website = 'MYS'
       ORDER BY e.position ASC, e.id DESC`,
    );

    const formatted = rows.map((r) => ({
      ...r,
      thumbnail_path: r.thumbnail_path
        ? r.thumbnail_path.startsWith("/")
          ? r.thumbnail_path
          : `/${r.thumbnail_path}`
        : "",
      og_image_path: r.og_image_path
        ? r.og_image_path.startsWith("/")
          ? r.og_image_path
          : `/${r.og_image_path}`
        : "",
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { status: false, message: "Failed to fetch exams", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let page_name = "";
    let headline = "";
    let description = "";
    let position = "1";
    let meta_title = "";
    let meta_keyword = "";
    let meta_description = "";
    let seo_rating = "";
    let best_rating = "";
    let review_number = "";
    let imgname = "";
    let imgpath = "";
    let og_image = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      page_name =
        (formData.get("page_name") as string) ||
        (formData.get("name") as string) ||
        "";
      headline =
        (formData.get("headline") as string) ||
        (formData.get("title") as string) ||
        "";
      description = (formData.get("description") as string) || "";
      position = (formData.get("position") as string) || "1";
      meta_title = (formData.get("meta_title") as string) || "";
      meta_keyword = (formData.get("meta_keyword") as string) || "";
      meta_description = (formData.get("meta_description") as string) || "";
      seo_rating = (formData.get("seo_rating") as string) || "";
      best_rating = (formData.get("best_rating") as string) || "";
      review_number = (formData.get("review_number") as string) || "";

      const thumbFile = formData.get("thumbnail") as File | null;
      if (thumbFile && typeof thumbFile === "object" && thumbFile.name) {
        const saved = await saveUploadedFile(
          thumbFile,
          thumbFile.name,
          "exams",
        );
        imgname = saved.file_name;
        imgpath = saved.file_path;
      }

      const ogFile = formData.get("og_image") as File | null;
      if (ogFile && typeof ogFile === "object" && ogFile.name) {
        const savedOg = await saveUploadedFile(ogFile, ogFile.name, "exams");
        og_image = savedOg.file_path;
      }
    } else {
      const body = await req.json();
      page_name = body.page_name || body.name || "";
      headline = body.headline || body.title || "";
      description = body.description || "";
      position = body.position || "1";
      meta_title = body.meta_title || "";
      meta_keyword = body.meta_keyword || "";
      meta_description = body.meta_description || "";
      seo_rating = body.seo_rating || "";
      best_rating = body.best_rating || "";
      review_number = body.review_number || "";
      imgpath = body.thumbnail_path || body.imgpath || "";
      og_image = body.og_image_path || body.og_image || "";
    }

    if (!page_name.trim()) {
      return NextResponse.json(
        { status: false, message: "Page name is required" },
        { status: 400 },
      );
    }

    const uri = slugify(page_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO exams (website, page_name, uri, headline, description, position, imgname, imgpath, og_image, meta_title, meta_keyword, meta_description, seo_rating, best_rating, review_number, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      page_name,
      uri,
      headline,
      description,
      parseInt(position, 10) || 1,
      imgname,
      imgpath,
      og_image,
      meta_title,
      meta_keyword,
      meta_description,
      seo_rating ? parseFloat(seo_rating) : null,
      best_rating ? parseFloat(best_rating) : null,
      review_number ? parseInt(review_number, 10) : null,
      now,
      now,
    );

    const [lastInsert]: any[] = await prisma.$queryRawUnsafe(`SELECT LAST_INSERT_ID() as id`);
    const newId = lastInsert?.id ? Number(lastInsert.id) : undefined;

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'exams',
      recordId: newId,
      description: `Created exam '${page_name}'`,
      newValues: { page_name, uri, headline, position },
    });

    return NextResponse.json({
      status: true,
      message: "Exam created successfully",
    });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { status: false, message: "Failed to create exam", error: error.message },
      { status: 500 },
    );
  }
}
