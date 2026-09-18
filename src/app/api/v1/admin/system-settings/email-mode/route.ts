import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog } from "@/lib/auditLogger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email_mode = body.email_mode === "testing" ? "testing" : "main";

    // Fetch old value for audit logging
    const oldRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT \`value\` FROM system_settings WHERE \`key\` = 'email_mode' LIMIT 1`
    );
    const oldValue = oldRows.length > 0 ? oldRows[0].value : null;

    // Upsert into system_settings
    await prisma.$executeRawUnsafe(
      `INSERT INTO system_settings (\`key\`, \`value\`, \`type\`, \`description\`, \`created_at\`, \`updated_at\`)
       VALUES ('email_mode', ?, 'string', 'Email Dispatch Mode (main or testing)', NOW(), NOW())
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), \`updated_at\` = NOW()`,
      email_mode
    );

    await recordAuditLog({
      req,
      action: "UPDATE",
      module: "system-settings",
      description: `Updated email dispatch mode to '${email_mode}'`,
      oldValues: { email_mode: oldValue },
      newValues: { email_mode },
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: `Email mode updated to ${email_mode.toUpperCase()}`,
      email_mode,
    });
  } catch (error: any) {
    console.error("Error updating email mode:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Failed to update email mode",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
