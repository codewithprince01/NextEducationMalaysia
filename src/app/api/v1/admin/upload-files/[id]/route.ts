import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteUploadedFile } from "@/lib/fileStorage";
import { recordAuditLog } from "@/lib/auditLogger";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM upload_files WHERE id = ? LIMIT 1`,
      id,
    );
    const oldValues = rows.length > 0 ? rows[0] : null;

    if (oldValues && oldValues.file_path) {
      await deleteUploadedFile(oldValues.file_path);
    }

    await prisma.$executeRawUnsafe(`DELETE FROM upload_files WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'upload-files',
      recordId: id,
      description: `Deleted file '${oldValues?.title || oldValues?.file_name || id}' (ID: ${id})`,
      oldValues,
    });

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
