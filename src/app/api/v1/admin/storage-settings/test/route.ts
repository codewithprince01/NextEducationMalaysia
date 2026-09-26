import { NextRequest, NextResponse } from "next/server";
import { testRemoteStorageConnection } from "@/lib/remoteStorage";
import { recordAuditLog } from "@/lib/auditLogger";

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const result = await testRemoteStorageConnection(body);

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'storage-settings',
      description: `Tested storage FTP connection: ${result.success ? 'Success' : 'Failed'} (${result.message})`,
      newValues: {
        success: result.success,
        message: result.message,
      },
    });

    return NextResponse.json({
      status: result.success,
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error testing FTP connection:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: error.message || "Failed to test FTP connection",
      },
      { status: 500 }
    );
  }
}
