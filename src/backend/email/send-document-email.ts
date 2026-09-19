import { sendMail } from './sender';
import { prisma } from '@/lib/db';

export interface DocumentUploadEmailData {
  studentId: number | bigint | string;
  docName: string;
  fileName: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  fullFilePath: string;
  requestOrigin?: string;
}

const ADMIN_TO = 'studytutelage@gmail.com';
const ADMIN_CC = 'amanahlawat1918@gmail.com';
const ADMIN_BCC = 'prinsai.britannica@gmail.com';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
 * Sends notification emails with the attached document to ADMIN_TO, ADMIN_CC, and ADMIN_BCC.
 * This runs safely and never throws so student document uploads are never blocked.
 */
export async function sendDocumentUploadEmail(data: DocumentUploadEmailData): Promise<void> {
  try {
    // 1. Fetch student information from leads table
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
    const homePhone = student?.home_contact_number ? String(student.home_contact_number).trim() : null;
    const nationality = student?.nationality ? String(student.nationality).trim() : null;
    const location = [student?.city, student?.state, student?.country].filter(Boolean).map((s: any) => String(s).trim()).join(', ') || null;

    const originalName = data.originalFileName || data.fileName;
    const fileSizeStr = formatBytes(data.fileSize);
    const origin = (data.requestOrigin || 'https://www.educationmalaysia.in').replace(/\/+$/, '');
    const docOnlineUrl = `${origin}/storage/uploads/documents/${data.fileName}`;

    const subject = `📄 New Document Uploaded: ${data.docName} - ${studentName} (ID: #${data.studentId})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 28px 32px; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff;">
          🎓 Education Malaysia — Student Document Alert
        </h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9; color: #e0e7ff;">
          A student has uploaded a new document in the portal.
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px;">
        
        <!-- Summary Callout -->
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">
            📎 Document: <span style="color: #0f172a; font-weight: 700;">${escapeHtml(data.docName)}</span>
          </p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #3b82f6;">
            Uploaded by <strong>${escapeHtml(studentName)}</strong> (Student ID: <strong>#${escapeHtml(data.studentId)}</strong>). The file is attached directly to this email.
          </p>
        </div>

        <!-- Student Details -->
        <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          👤 Student Profile Details
        </h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; width: 38%; font-weight: 500;">Student ID</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">#${escapeHtml(data.studentId)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Full Name</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(studentName)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Email Address</td>
            <td style="padding: 10px 0; color: #2563eb; font-weight: 600;">
              <a href="mailto:${escapeHtml(studentEmail)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(studentEmail)}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Mobile / WhatsApp</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(mobileNum)}</td>
          </tr>
          ${homePhone ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Home Contact</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(homePhone)}</td>
          </tr>
          ` : ''}
          ${nationality ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Nationality</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(nationality)}</td>
          </tr>
          ` : ''}
          ${location ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Location</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${escapeHtml(location)}</td>
          </tr>
          ` : ''}
        </table>

        <!-- Document Details -->
        <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          📂 Uploaded Document Info
        </h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; width: 38%; font-weight: 500;">Document Title</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 700;">${escapeHtml(data.docName)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Original File Name</td>
            <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(originalName)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">File Size</td>
            <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(fileSizeStr)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Upload Time</td>
            <td style="padding: 10px 0; color: #0f172a;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Direct Link</td>
            <td style="padding: 10px 0; color: #2563eb;">
              <a href="${escapeHtml(docOnlineUrl)}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 500;">
                View Document &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Attachment Highlight Box -->
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 16px; text-align: center; margin-top: 10px;">
          <p style="margin: 0; font-size: 13px; color: #475569;">
            📎 <strong>Attachment Included:</strong> <code>${escapeHtml(originalName)}</code> (${escapeHtml(fileSizeStr)}) is attached directly to this email.
          </p>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          This is an automated notification from the Education Malaysia Student Portal.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
    `.trim();

    const attachments = [
      {
        filename: originalName,
        path: data.fullFilePath,
        contentType: data.mimeType,
      },
    ];

    // Primary delivery: send to ADMIN_TO with CC and BCC
    try {
      await sendMail({
        to: ADMIN_TO,
        cc: ADMIN_CC,
        bcc: ADMIN_BCC,
        subject,
        html,
        attachments,
        priority: 'high',
      });
      console.log(`[DocumentUploadEmail] Notification successfully sent for student #${data.studentId} to ${ADMIN_TO}, CC: ${ADMIN_CC}, BCC: ${ADMIN_BCC}`);
    } catch (primaryErr) {
      console.warn('[DocumentUploadEmail] Primary combined send failed, attempting individual delivery fallback:', primaryErr);
      await Promise.allSettled([
        sendMail({ to: ADMIN_TO, subject, html, attachments, priority: 'high' }),
        sendMail({ to: ADMIN_CC, subject, html, attachments, priority: 'high' }),
        sendMail({ to: ADMIN_BCC, subject, html, attachments, priority: 'high' }),
      ]);
      console.log(`[DocumentUploadEmail] Individual fallback delivery completed for student #${data.studentId}`);
    }
  } catch (error) {
    console.error('[DocumentUploadEmail] Unexpected error in sendDocumentUploadEmail:', error);
  }
}
