import { NextRequest, NextResponse } from "next/server";
import { getStorageConfig, updateStorageConfig } from "@/lib/remoteStorage";
import { recordAuditLog } from "@/lib/auditLogger";

export async function GET() {
  try {
    const config = await getStorageConfig(true);
    return NextResponse.json({
      status: true,
      success: true,
      config,
    });
  } catch (error: any) {
    console.error("Error fetching storage settings:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Failed to fetch storage settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await updateStorageConfig(body);

    await recordAuditLog({
      req,
      action: "UPDATE",
      module: "system_settings",
      recordId: "sftp_storage",
      description: "Updated SFTP / FTP storage configuration",
      newValues: body,
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: result.message,
      config: result.config,
    });
  } catch (error: any) {
    console.error("Error updating storage settings:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: error.message || "Failed to update storage settings",
      },
      { status: 500 }
    );
  }
}
