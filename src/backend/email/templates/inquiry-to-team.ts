import type { InquiryPayload } from '../../types';

// ============================================================
// INQUIRY TEAM NOTIFICATION TEMPLATE (sent to internal team)
// Mirrors Laravel mails/inquiry-mail-to-team.blade.php
// ============================================================

export function inquiryToTeamHtml(data: InquiryPayload): string {
  const rows = [
    data.nationality ? `<tr><td><strong>Nationality:</strong></td><td>${data.nationality}</td></tr>` : '',
    data.university ? `<tr><td><strong>University of Interest:</strong></td><td>${data.university}</td></tr>` : '',
    data.program
      ? `<tr><td><strong>Program:</strong></td><td>${data.program}</td></tr>`
      : '',
    data.interest
      ? `<tr><td><strong>Interest:</strong></td><td>${data.interest}</td></tr>`
      : '',
    data.source_path
      ? `<tr><td><strong>Source Page:</strong></td><td>${data.source_path}</td></tr>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>New Enquiry Alert</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 14px; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .footer { font-size: 12px; color: #aaa; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔔 New Enquiry Alert</h2>
    <p>A new lead has been submitted. Please follow up promptly.</p>
    <span class="badge">Source: ${data.source}</span>
    <h3>Lead Details:</h3>
    <table>
      <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
      <tr><td><strong>Mobile:</strong></td><td>+${data.country_code} ${data.mobile}</td></tr>
      ${rows}
    </table>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Education Malaysia — Internal Notification
    </div>
  </div>
</body>
</html>
  `.trim();
}
