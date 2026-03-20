import type { InquiryPayload } from '../../types';

// ============================================================
// INQUIRY REPLY TEMPLATE (sent to the user)
// Mirrors Laravel mails/inquiry-reply.blade.php
// ============================================================

export function inquiryReplyHtml(data: InquiryPayload): string {
  const rows = [
    data.nationality ? `<tr><td><strong>Nationality:</strong></td><td>${data.nationality}</td></tr>` : '',
    data.university ? `<tr><td><strong>University of Interest:</strong></td><td>${data.university}</td></tr>` : '',
    data.program || data.interest
      ? `<tr><td><strong>Program of Interest:</strong></td><td>${data.program ?? data.interest}</td></tr>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>We Received Your Request</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 14px; }
    .footer { font-size: 12px; color: #aaa; margin-top: 32px; }
    .highlight { color: #1a56db; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hello, ${data.name}!</h2>
    <p>Thank you for reaching out to <strong>Education Malaysia</strong>. We have received your request and our team will get back to you shortly.</p>
    <h3>Your Submitted Details:</h3>
    <table>
      <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
      <tr><td><strong>Mobile:</strong></td><td>+${data.country_code} ${data.mobile}</td></tr>
      <tr><td><strong>Source:</strong></td><td>${data.source}</td></tr>
      ${rows}
    </table>
    <p>If you have any questions, feel free to reply to this email or contact us at <a href="mailto:info@educationmalaysia.in" class="highlight">info@educationmalaysia.in</a>.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Education Malaysia. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}
