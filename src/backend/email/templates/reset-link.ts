export function resetPasswordLinkEmailHtml(name: string, resetLink: string): string {
  return `
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />
  </head>
  <body style="width:100%;height:100%;background:#efefef;color:#3E3E3E;font-family:Helvetica, Arial, sans-serif;line-height:1.65;margin:0;padding:0;">
    <table border="0" cellpadding="0" cellspacing="0" style="width:100%;background:#efefef;margin:0;padding:0;">
      <tr>
        <td valign="top" style="display:block;clear:both;margin:0 auto;max-width:580px;">
          <table border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td valign="top" align="center" style="padding:20px 0 5px 0;background:#3f4079;color:white;">
                <h1 style="font-size:28px;margin:0 auto;max-width:90%;line-height:1.25;">Education Malaysia</h1>
              </td>
            </tr>
            <tr>
              <td valign="top" style="background:white;padding:25px;">
                <p style="text-align:justify;">
                  Hi ${name || 'Student'},
                  <br/><br/>
                  Sorry to hear you are having trouble logging in. We got a message that you forgot your password.
                  If this was you, you can reset your password now.
                </p>
                <a href="${resetLink}" style="display:inline-block;font-weight:bold;background:#3f4079;color:#fff;padding:12px 25px;font-size:15px;border-radius:4px;text-decoration:none;">
                  Reset your password
                </a>
                <p style="margin-top:14px;font-size:13px;color:#6b7280;">This link will expire in 30 minutes.</p>
              </td>
            </tr>
            <tr>
              <td valign="top" align="center" style="padding:20px 0;background:#e74e84;color:white;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

