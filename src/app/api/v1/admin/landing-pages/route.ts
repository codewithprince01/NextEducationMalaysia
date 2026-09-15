import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt, slugify } from "@/lib/utils";
import { saveUploadedFile } from "@/lib/fileStorage";

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT lp.*,
              (SELECT COUNT(*) FROM landing_page_banners lpb WHERE lpb.landing_page_id = lp.id) AS banners_count,
              (SELECT COUNT(*) FROM landing_page_universities lpu WHERE lpu.landing_page_id = lp.id) AS universities_count,
              (SELECT COUNT(*) FROM landing_page_faqs lpf WHERE lpf.landing_page_id = lp.id) AS faqs_count
       FROM landing_pages lp 
       WHERE lp.website = 'MYS' 
       ORDER BY lp.id DESC`,
    );

    const formatted = rows.map((r) => ({
      ...r,
      banners_count: Number(r.banners_count || 0),
      universities_count: Number(r.universities_count || 0),
      faqs_count: Number(r.faqs_count || 0),
      date_and_address_image: r.date_and_address_image
        ? r.date_and_address_image.startsWith("/")
          ? r.date_and_address_image
          : `/${r.date_and_address_image}`
        : "",
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error("Error fetching landing_pages:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch landing pages",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let page_name = "";
    let page_slug = "";
    let date_and_address = "";
    let date_and_address_image_path = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      page_name = (formData.get("page_name") as string) || "";
      page_slug = (formData.get("page_slug") as string) || "";
      date_and_address = (formData.get("date_and_address") as string) || "";
      const file = formData.get("date_and_address_image") as File | null;

      if (file && typeof file === "object" && file.name) {
        const saved = await saveUploadedFile(file, file.name, "landingpage");
        date_and_address_image_path = saved.file_path;
      }
    } else {
      const body = await req.json();
      page_name = body.page_name || "";
      page_slug = body.page_slug || "";
      date_and_address = body.date_and_address || "";
      date_and_address_image_path = body.date_and_address_image || "";
    }

    if (!page_name) {
      return NextResponse.json(
        { status: false, message: "Page name is required" },
        { status: 400 },
      );
    }

    const slugVal = page_slug ? slugify(page_slug) : slugify(page_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO landing_pages (website, page_name, page_slug, date_and_address, date_and_address_image, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?)`,
      page_name,
      slugVal,
      date_and_address || null,
      date_and_address_image_path || null,
      now,
      now,
    );

    return NextResponse.json({
      status: true,
      message: "Record has been added successfully.",
    });
  } catch (error: any) {
    console.error("Error creating landing_page:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to create landing page",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
