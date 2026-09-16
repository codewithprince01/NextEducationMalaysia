import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";
import { saveUploadedFile } from "@/lib/fileStorage";

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM upload_files ORDER BY id DESC`,
    );

    const data = rows.map((item) => ({
      ...item,
      file_path: item.file_path
        ? item.file_path.startsWith("/")
          ? item.file_path
          : `/${item.file_path}`
        : "",
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(data),
    });
  } catch (error: any) {
    console.error("Error fetching upload_files:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch upload files",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string) || "";
    const file = formData.get("file") as File | null;
    const manualFilePath = formData.get("file_path") as string | null;
    const targetFolder = (formData.get("folder") as string) || "files";

    let fileName = "";
    let filePath = "";

    if (file && typeof file === "object" && file.name) {
      const res = await saveUploadedFile(file, file.name, targetFolder);
      fileName = res.file_name;
      filePath = res.file_path;
    } else if (manualFilePath) {
      filePath = manualFilePath.startsWith("/")
        ? manualFilePath.slice(1)
        : manualFilePath;
      fileName = filePath.split("/").pop() || filePath;
    } else {
      return NextResponse.json(
        { status: false, message: "File is required" },
        { status: 400 },
      );
    }

    const docTitle = title || file?.name || fileName;
    const fileType = file?.type || fileName.split(".").pop() || "image";
    const now = new Date();

    const [maxRes]: any[] = await prisma.$queryRawUnsafe(
      `SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM upload_files`,
    );
    const nextId = Number(maxRes?.next_id || 1);

    // Insert record into upload_files if title or file was uploaded
    await prisma.$executeRawUnsafe(
      `INSERT INTO upload_files (id, website, title, file_name, file_path, file_type, created_at, updated_at)
       VALUES (?, 'MYS', ?, ?, ?, ?, ?, ?)`,
      nextId,
      docTitle,
      fileName,
      filePath,
      fileType,
      now,
      now,
    );

    return NextResponse.json({
      status: true,
      success: true,
      message: "File uploaded successfully",
      file_name: fileName,
      file_path: filePath,
      file_url: `/storage/${filePath.replace(/^\//, "")}`,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { status: false, message: "Failed to upload file", error: error.message },
      { status: 500 },
    );
  }
}
