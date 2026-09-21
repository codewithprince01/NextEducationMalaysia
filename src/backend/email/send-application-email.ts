import { sendMail } from './sender';
import { prisma } from '@/lib/db';

export interface ProgramApplicationEmailData {
  studentId: number | bigint | string;
  appId?: number | bigint | string | null;
  programId?: number | bigint | string | null;
  courseName: string;
  universityName?: string | null;
  studyMode?: string | null;
  duration?: string | null;
  intake?: string | null;
  tuitionFee?: string | null;
  requestOrigin?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends notification emails when a student applies for a university program.
 * Dynamically respects system_settings (email_mode, testing_to_email, main_to_email, etc.).
 */
export async function sendProgramApplicationEmail(data: ProgramApplicationEmailData): Promise<void> {
  try {
    // 1. Fetch recipient configuration from system_settings
    let toEmail = 'studytutelage@gmail.com';
    let toName = 'Team tutelage Study';
    let ccEmail = 'amanahlawat1918@gmail.com';
    let ccName = 'Aman Ahlawat';
    let bccEmail = 'farazahmad280@gmail.com';
    let bccName = 'Mohd Faraz';

    try {
      const settingsRows: any[] = await prisma.$queryRawUnsafe(
        `SELECT \`key\`, \`value\` FROM system_settings`
      );
      const settingsMap: Record<string, string> = {};
      for (const r of settingsRows) {
        if (r.key) settingsMap[r.key] = r.value ?? '';
      }
      const emailMode = settingsMap['email_mode'] || 'main';
      if (emailMode === 'testing') {
        toEmail = settingsMap['testing_to_email'] || 'farazahmad280@gmail.com';
        toName = settingsMap['testing_to_name'] || 'Testing Team';
        ccEmail = settingsMap['testing_cc_email'] || '';
        ccName = settingsMap['testing_cc_name'] || '';
        bccEmail = settingsMap['testing_bcc_email'] || '';
        bccName = settingsMap['testing_bcc_name'] || '';
      } else {
        toEmail = settingsMap['main_to_email'] || toEmail;
        toName = settingsMap['main_to_name'] || toName;
        ccEmail = settingsMap['main_cc_email'] || ccEmail;
        ccName = settingsMap['main_cc_name'] || ccName;
        bccEmail = settingsMap['main_bcc_email'] || bccEmail;
        bccName = settingsMap['main_bcc_name'] || bccName;
      }
    } catch (settingsErr) {
      console.warn('[ProgramApplicationEmail] Failed to load system_settings, using defaults:', settingsErr);
    }

    // 2. Fetch student details from leads table
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT id, name, email, country_code, mobile, home_contact_number, nationality, city, state, country 
       FROM leads 
       WHERE id = ? 
       LIMIT 1`,
      Number(data.studentId)
    )) as any[];

    const student = rows[0] || null;
    const studentName = student?.name ? String(student.name).trim() : 'Student';
    const studentEmail = student?.email ? String(student.email).trim() : 'N/A';
    const countryCode = student?.country_code ? `+${String(student.country_code).replace(/^\+/, '').trim()}` : '';
    const rawMobile = student?.mobile ? String(student.mobile).trim() : '';
    const mobileNum = rawMobile ? `${countryCode} ${rawMobile}`.trim() : 'N/A';
    const nationality = student?.nationality ? String(student.nationality).trim() : 'N/A';
    const location = [student?.city, student?.state, student?.country].filter(Boolean).map((s: any) => String(s).trim()).join(', ') || 'N/A';

    const courseName = data.courseName || 'Program Application';
    const universityName = data.universityName || 'Malaysian University';
    const appIdStr = data.appId ? `#${data.appId}` : 'New';
    const stdIdStr = `#${data.studentId}`;
    const timestampStr = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kuala_Lumpur',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const crmLeadUrl = `https://portal.britannicaoverseas.com/admin/lead/${Number(data.studentId)}?tab=applications`;

    const subject = `🎓 New Program Application: ${studentName} applied for ${courseName} (${universityName})`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Program Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%); padding: 28px 24px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 9999px; padding: 6px 14px; margin-bottom: 12px;">
                      <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">New Application Alert</span>
                    </div>
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; line-height: 1.25;">
                      New University Program Applied! 🎓
                    </h1>
                    <p style="color: #dbeafe; font-size: 13px; margin: 0; font-weight: 500;">
                      A student has submitted a new program application on Education Malaysia
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Card -->
          <tr>
            <td style="padding: 24px 24px 8px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="padding-right: 12px;">
                          <div style="width: 36px; height: 36px; background-color: #2563eb; border-radius: 8px; text-align: center; line-height: 36px; font-size: 18px; color: #ffffff;">
                            🎓
                          </div>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 3px 0; font-size: 15px; font-weight: 800; color: #1e3a8a; line-height: 1.3;">
                            ${escapeHtml(courseName)}
                          </p>
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #3b82f6;">
                            🏛️ ${escapeHtml(universityName)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Program Details Table -->
          <tr>
            <td style="padding: 12px 24px;">
              <h2 style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 10px 0;">
                Program Information
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td width="38%" style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">University</td>
                  <td width="62%" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(universityName)}</td>
                </tr>
                <tr style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Course / Program</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #1e40af;">${escapeHtml(courseName)}</td>
                </tr>
                ${data.intake ? `
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Intake</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(data.intake)}</td>
                </tr>` : ''}
                ${data.duration ? `
                <tr style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Duration</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(data.duration)}</td>
                </tr>` : ''}
                ${data.studyMode ? `
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Study Mode</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(data.studyMode)}</td>
                </tr>` : ''}
                ${data.tuitionFee ? `
                <tr style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Tuition Fee</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #047857;">${escapeHtml(data.tuitionFee)}</td>
                </tr>` : ''}
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Application ID</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(appIdStr)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Student Details Table -->
          <tr>
            <td style="padding: 8px 24px 16px 24px;">
              <h2 style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 10px 0;">
                Applicant Details
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td width="38%" style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Student Name</td>
                  <td width="62%" style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0f172a;">${escapeHtml(studentName)} <span style="font-size: 11px; font-weight: 500; color: #64748b;">(ID: ${escapeHtml(stdIdStr)})</span></td>
                </tr>
                <tr style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Email Address</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #2563eb;">
                    <a href="mailto:${escapeHtml(studentEmail)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(studentEmail)}</a>
                  </td>
                </tr>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Phone / WhatsApp</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">
                    <a href="tel:${escapeHtml(rawMobile)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(mobileNum)}</a>
                  </td>
                </tr>
                <tr style="background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Nationality</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(nationality)}</td>
                </tr>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Location</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #0f172a;">${escapeHtml(location)}</td>
                </tr>
                <tr style="background-color: #ffffff;">
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #64748b;">Application Time</td>
                  <td style="padding: 10px 14px; font-size: 12px; font-weight: 500; color: #64748b;">${escapeHtml(timestampStr)} (MYT)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 8px 24px 24px 24px; text-align: center;">
              <a href="${crmLeadUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);">
                👉 Open Lead & Application in CRM
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #64748b;">
                Education Malaysia • Automated Admissions Notification
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                This email was sent to ${escapeHtml(toEmail)} based on your CRM notification settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    await sendMail({
      to: toEmail,
      toName,
      cc: ccEmail || undefined,
      ccName: ccName || undefined,
      bcc: bccEmail || undefined,
      subject,
      html,
      priority: 'high',
    });

    console.log(`[ProgramApplicationEmail] Sent application email for student #${data.studentId} to ${toEmail}`);
  } catch (err) {
    console.error('[ProgramApplicationEmail] Failed to send application email:', err);
  }
}
