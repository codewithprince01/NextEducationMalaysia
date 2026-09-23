import { NextRequest, NextResponse } from "next/server";
import { testRemoteStorageConnection } from "@/lib/remoteStorage";

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const result = await testRemoteStorageConnection(body);
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
