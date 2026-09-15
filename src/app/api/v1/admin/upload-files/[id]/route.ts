import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteUploadedFile } from "@/lib/fileStorage";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT file_path FROM upload_files WHERE id = ?`,
      id,
    );
    if (rows.length > 0 && rows[0].file_path) {
      await deleteUploadedFile(rows[0].file_path);
    }

    await prisma.$executeRawUnsafe(`DELETE FROM upload_files WHERE id = ?`, id);
    return NextResponse.json({
      status: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { status: false, message: "Failed to delete file", error: error.message },
      { status: 500 },
    );
  }
}
