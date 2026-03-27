export function forgotPasswordLinkEmailHtml(input: {
  name: string;
  resetPasswordLink: string;
  loginLink: string;
}) {
  const name = input.name || 'Student';
  const resetPasswordLink = input.resetPasswordLink;
  const loginLink = input.loginLink;

  return `
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width" />
      <style>
        .btn {
          display: inline-block;
          font-weight: 700;
          background: #1f5eff;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          font-size: 15px;
          border-radius: 8px;
          border: 0;
        }
        .btn:hover {
          background: #1e40af;
        }
      </style>
    </head>
    <body style="width:100%;height:100%;background:#eef3fb;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:none;color:#24334d;font-family:Helvetica, Arial, sans-serif;line-height:1.65;margin:0;padding:0;">
      <table border="0" cellpadding="0" cellspacing="0" style="width:100%;background:#eef3fb;margin:0;padding:22px 0;">
        <tr>
          <td valign="top" style="display:block;clear:both;margin:0 auto;max-width:620px;">
            <table border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
              <tr>
                <td valign="top" align="center" style="padding:20px 24px;background:linear-gradient(135deg,#1f5eff,#2346a8);color:#ffffff;">
                  <h1 style="font-size:28px;margin:0;line-height:1.25;font-weight:800;">Education Malaysia</h1>
                  <p style="margin:8px 0 0 0;opacity:.95;font-size:14px;">Password Recovery</p>
                </td>
              </tr>
              <tr>
                <td valign="top" style="background:#ffffff;padding:26px 24px;">
                  <p style="margin:0 0 14px 0;">Hi ${name},</p>
                  <p style="margin:0 0 14px 0;">
                    Sorry to hear you are having trouble logging in. We got a request to reset your password.
                  </p>
                  <p style="margin:0 0 18px 0;">
                    Click below to reset your password:
                  </p>

                  <p style="margin:0 0 20px 0;">
                    <a class="btn" href="${resetPasswordLink}">Reset your password</a>
                  </p>

                  <p style="margin:0 0 8px 0;color:#4b5563;">
                    This link will expire in 30 minutes.
                  </p>
                  <p style="margin:0 0 8px 0;color:#4b5563;">
                    If the button does not work, copy and open this URL:
                  </p>
                  <p style="margin:0 0 16px 0;word-break:break-all;">
                    <a href="${resetPasswordLink}" style="color:#1f5eff;text-decoration:none;">${resetPasswordLink}</a>
                  </p>
                  <p style="margin:0;color:#4b5563;">
                    You can also login here:
                    <a href="${loginLink}" style="color:#1f5eff;text-decoration:none;">${loginLink}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td valign="top" align="center" style="padding:14px 24px;background:#1e3a8a;color:#dbeafe;font-size:12px;">
                  © ${new Date().getFullYear()} Education Malaysia. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

