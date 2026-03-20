// ============================================================
// OTP EMAIL TEMPLATE
// Mirrors Laravel mails/send-otp.blade.php
// ============================================================

export function otpEmailHtml(name: string, otp: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your OTP Code</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .otp-box { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a56db; text-align: center; padding: 20px; background: #eff6ff; border-radius: 6px; margin: 24px 0; }
    .footer { font-size: 12px; color: #aaa; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hello, ${name}!</h2>
    <p>Your One-Time Password (OTP) for Education Malaysia is:</p>
    <div class="otp-box">${otp}</div>
    <p>This OTP is valid for <strong>15 minutes</strong>. Do not share it with anyone.</p>
    <p>If you did not request this, please ignore this email.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Education Malaysia. All rights reserved.
    </div>
  </div>
</body>
</html>
  `.trim();
}
