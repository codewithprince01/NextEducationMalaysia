import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordAuditLog } from "@/lib/auditLogger";

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT \`key\`, \`value\`, \`type\`, \`description\` FROM system_settings`
    );

    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      if (row.key) {
        settingsMap[row.key] = row.value ?? "";
      }
    }

    const emailMode = settingsMap["email_mode"] || "main";

    const mainSettings = {
      main_to_email: settingsMap["main_to_email"] ?? "studytutelage@gmail.com",
      main_to_name: settingsMap["main_to_name"] ?? "Team tutelage Study",
      main_cc_email: settingsMap["main_cc_email"] ?? "amanahlawat1918@gmail.com",
      main_cc_name: settingsMap["main_cc_name"] ?? "Aman Ahlawat",
      main_bcc_email: settingsMap["main_bcc_email"] ?? "farazahmad280@gmail.com",
      main_bcc_name: settingsMap["main_bcc_name"] ?? "Mohd Faraz",
    };

    const testingSettings = {
      testing_to_email: settingsMap["testing_to_email"] ?? "test@example.com",
      testing_to_name: settingsMap["testing_to_name"] ?? "Test Email",
      testing_cc_email: settingsMap["testing_cc_email"] ?? "test@example.com",
      testing_cc_name: settingsMap["testing_cc_name"] ?? "Test CC",
      testing_bcc_email: settingsMap["testing_bcc_email"] ?? "test@example.com",
      testing_bcc_name: settingsMap["testing_bcc_name"] ?? "Test BCC",
    };

    return NextResponse.json({
      status: true,
      success: true,
      emailMode,
      mainSettings,
      testingSettings,
      rawSettings: settingsMap,
      totalCount: rows.length,
    });
  } catch (error: any) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        message: "Failed to fetch system settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
