import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeBigInt } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT uo.*, uo.title AS tab, u.name AS university_name
       FROM university_overviews uo
       LEFT JOIN universities u ON u.id = uo.university_id
       WHERE uo.id = ? LIMIT 1`,
      id,
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Overview not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: serializeBigInt(rows[0]) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch overview" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await request.json();
    const {
      tab,
      title,
      description,
      position,
      thumbnail_path,
      thumbnail_name,
    } = body;
    const tabTitle = title || tab;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_overviews 
       SET title = ?, description = ?, thumbnail_path = COALESCE(?, thumbnail_path), thumbnail_name = COALESCE(?, thumbnail_name), position = ?, updated_at = ?
       WHERE id = ?`,
      tabTitle,
      description || "",
      thumbnail_path !== undefined ? thumbnail_path : null,
      thumbnail_name !== undefined ? thumbnail_name : null,
      position ? parseInt(position, 10) : 0,
      now,
      id,
    );

    return NextResponse.json({
      success: true,
      message: "Overview updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating university overview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update overview" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    await prisma.$executeRawUnsafe(
      `DELETE FROM university_overviews WHERE id = ?`,
      id,
    );

    return NextResponse.json({ success: true, message: "Overview deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to delete overview" },
      { status: 500 },
    );
  }
}
