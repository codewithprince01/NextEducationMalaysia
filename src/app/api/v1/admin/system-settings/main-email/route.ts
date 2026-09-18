import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog } from "@/lib/auditLogger";

const MAIN_EMAIL_KEYS = [
  { key: "main_to_email", description: "Primary Main Recipient Email Address" },
  { key: "main_to_name", description: "Primary Main Recipient Display Name" },
  { key: "main_cc_email", description: "Main Carbon Copy (CC) Email Address" },
  { key: "main_cc_name", description: "Main Carbon Copy (CC) Display Name" },
  { key: "main_bcc_email", description: "Main Blind Carbon Copy (BCC) Email Address" },
  { key: "main_bcc_name", description: "Main Blind Carbon Copy (BCC) Display Name" },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const oldRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT \`key\`, \`value\` FROM system_settings WHERE \`key\` IN ('main_to_email', 'main_to_name', 'main_cc_email', 'main_cc_name', 'main_bcc_email', 'main_bcc_name')`
    );
    const oldValues: Record<string, string> = {};
    for (const r of oldRows) {
      oldValues[r.key] = r.value;
    }

    const newValues: Record<string, string> = {};

    for (const item of MAIN_EMAIL_KEYS) {
      const val = body[item.key] !== undefined ? String(body[item.key] ?? "").trim() : (oldValues[item.key] ?? "");
      newValues[item.key] = val;

      await prisma.$executeRawUnsafe(
        `INSERT INTO system_settings (\`key\`, \`value\`, \`type\`, \`description\`, \`created_at\`, \`updated_at\`)
         VALUES (?, ?, 'string', ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), \`updated_at\` = NOW()`,
        item.key,
        val,
        item.description
      );
    }

    await recordAuditLog({
      req,
      action: "UPDATE",
      module: "system-settings",
      description: "Updated main email configuration recipients",
      oldValues,
      newValues,
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: "Main email settings saved successfully",
      mainSettings: newValues,
    });
  } catch (error: any) {
    console.error("Error updating main email settings:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Failed to update main email settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
