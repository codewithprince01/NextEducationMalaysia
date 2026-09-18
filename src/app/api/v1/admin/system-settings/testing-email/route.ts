import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog } from "@/lib/auditLogger";

const TESTING_EMAIL_KEYS = [
  { key: "testing_to_email", description: "Testing Recipient Email Address" },
  { key: "testing_to_name", description: "Testing Recipient Display Name" },
  { key: "testing_cc_email", description: "Testing Carbon Copy (CC) Email Address" },
  { key: "testing_cc_name", description: "Testing Carbon Copy (CC) Display Name" },
  { key: "testing_bcc_email", description: "Testing Blind Carbon Copy (BCC) Email Address" },
  { key: "testing_bcc_name", description: "Testing Blind Carbon Copy (BCC) Display Name" },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const oldRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT \`key\`, \`value\` FROM system_settings WHERE \`key\` IN ('testing_to_email', 'testing_to_name', 'testing_cc_email', 'testing_cc_name', 'testing_bcc_email', 'testing_bcc_name')`
    );
    const oldValues: Record<string, string> = {};
    for (const r of oldRows) {
      oldValues[r.key] = r.value;
    }

    const newValues: Record<string, string> = {};

    for (const item of TESTING_EMAIL_KEYS) {
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
      description: "Updated testing email configuration recipients",
      oldValues,
      newValues,
    });

    return NextResponse.json({
      status: true,
      success: true,
      message: "Testing email settings saved successfully",
      testingSettings: newValues,
    });
  } catch (error: any) {
    console.error("Error updating testing email settings:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Failed to update testing email settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
