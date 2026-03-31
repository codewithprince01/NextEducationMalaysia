import { sendMail } from './sender';

export interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  nationality?: string | null;
  university?: string | null;
  message?: string | null;
  formType?: string | null;
  sourceUrl?: string | null;
  extraFields?: Record<string, unknown> | null;
}

const ADMIN_TO = 'studytutelage@gmail.com';
const ADMIN_CC = 'amanahlawat1918@gmail.com';
const ADMIN_BCC = 'prinsai.britannica@gmail.com';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function printable(value?: string | null): string {
  const v = String(value || '').trim();
  return v || 'N/A';
}

function inferRequestLabel(formType?: string | null): string {
  const t = String(formType || '').toLowerCase();
  if (t.includes('fee')) return 'Fees';
  if (t.includes('brochure')) return 'Brochure';
  if (t.includes('counselling') || t.includes('book session')) return 'Counselling Session';
  if (t.includes('modal') || t.includes('popup') || t.includes('malaysia calling')) return 'Malaysia Calling';
  if (t.includes('contact')) return 'Contact';
  if (t.includes('get in touch')) return 'Get In Touch';
  return 'General';
}

function buildAdminSubject(data: LeadEmailData): string {
  const label = inferRequestLabel(data.formType);
  const uni = String(data.university || '').trim();
  if (uni) {
    return `New ${label} request inquiry for ${uni} - Team Attention Needed`;
  }
  return `New ${label} request inquiry - Team Attention Needed`;
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildUserSubject(data: LeadEmailData): string {
  const uni = String(data.university || '').trim();
  if (uni) {
    return `We have Received Your Request for brochure/fees of ${uni} - Expect a Response Soon`;
  }
  return 'We have Received Your Request for brochure/fees - Expect a Response Soon';
}

function adminTemplate(data: LeadEmailData): string {
  const excludedKeys = new Set(['university_id', 'requestfor']);
  const labelMap: Record<string, string> = {
    name: 'Name',
    email: 'Email',
    phone: 'Mobile',
    mobile: 'Mobile',
    c_code: 'Country Code',
    country_code: 'Country Code',
    nationality: 'Nationality',
    university: 'University',
    university_name: 'University',
    university_id: 'University Id',
    formType: 'Form Type',
    requestfor: 'Requestfor',
    highest_qualification: 'Highest Qualification',
    interested_course_category: 'Interested Course Category',
    interested_program: 'Interested Program',
    message: 'Message',
    sourceUrl: 'Source Path',
    source_path: 'Source Path',
    dayslot: 'Dayslot',
    timeslot: 'Timeslot',
    time_zone: 'Time Zone',
  };

  const byLabel = new Map<string, string>();
  const addField = (key: string, value: unknown) => {
    if (excludedKeys.has(String(key).toLowerCase())) return;
    if (value == null) return;
    const v = String(value).trim();
    if (!v) return;
    const label = labelMap[key] || formatKey(key);
    const existing = byLabel.get(label);
    if (!existing || existing === 'N/A') byLabel.set(label, v);
  };

  addField('name', data.name);
  addField('email', data.email);
  addField('phone', data.phone);
  addField('nationality', data.nationality);
  addField('university', data.university);
  addField('formType', data.formType);
  addField('message', data.message);
  addField('sourceUrl', data.sourceUrl);

  Object.entries(data.extraFields || {}).forEach(([k, v]) => addField(k, v));

  const preferredOrder = [
    'Name',
    'Email',
    'Mobile',
    'Nationality',
    'University',
    'Form Type',
    'Message',
    'Source Path',
    'Country Code',
    'Highest Qualification',
    'Interested Course Category',
    'Interested Program',
    'Dayslot',
    'Timeslot',
    'Time Zone',
  ];

  const ordered = [
    ...preferredOrder.filter((label) => byLabel.has(label)),
    ...Array.from(byLabel.keys())
      .filter((label) => !preferredOrder.includes(label))
      .sort((a, b) => a.localeCompare(b)),
  ];

  const rowsHtml = ordered
    .map((label) => {
      const value = byLabel.get(label) || '';
      if (label === 'Email') {
        return `<li style="margin:8px 0;">${escapeHtml(label)} : <a href="mailto:${escapeHtml(value)}" style="color:#1d4ed8;">${escapeHtml(value)}</a></li>`;
      }
      if (label === 'Source Path' && /^https?:\/\//i.test(value)) {
        return `<li style="margin:8px 0;">${escapeHtml(label)} : <a href="${escapeHtml(value)}" style="color:#1d4ed8;">${escapeHtml(value)}</a></li>`;
      }
      return `<li style="margin:8px 0;">${escapeHtml(label)} : ${escapeHtml(value)}</li>`;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>New Inquiry from Education Malaysia</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f1f1;font-family:Arial,sans-serif;color:#333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f1f1;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="700" cellspacing="0" cellpadding="0" style="max-width:700px;width:100%;background:#ffffff;border:1px solid #e5e7eb;">
            <tr>
              <td align="center" style="background:#3d3f84;padding:22px 20px;">
                <h1 style="margin:0;color:#ffffff;font-size:40px;line-height:1.1;font-weight:700;">Education Malaysia</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px 24px 34px;font-size:16px;line-height:1.6;color:#333333;">
                <p style="margin:0 0 22px 0;">Hi Team,</p>
                <p style="margin:0 0 26px 0;"><strong>New Inquiry from Education Malaysia</strong></p>
                <ul style="margin:0 0 30px 22px;padding:0;">
                  ${rowsHtml}
                </ul>
                <p style="margin:0 0 8px 0;">Please review and follow up as needed.</p>
                <p style="margin:0;">Best regards,<br/><strong>Education Malaysia Team</strong></p>
              </td>
            </tr>
            <tr>
              <td style="height:26px;background:#e24886;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `.trim();
}

function userTemplate(data: LeadEmailData): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Thank You for Contacting Education Malaysia</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f1f1;font-family:Arial,sans-serif;color:#333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f1f1;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="700" cellspacing="0" cellpadding="0" style="max-width:700px;width:100%;background:#ffffff;border:1px solid #e5e7eb;">
            <tr>
              <td align="center" style="background:#3d3f84;padding:22px 20px;">
                <h1 style="margin:0;color:#ffffff;font-size:40px;line-height:1.1;font-weight:700;">Education Malaysia</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px 24px 34px;font-size:16px;line-height:1.7;color:#333333;">
                <p style="margin:0 0 18px 0;">Dear ${escapeHtml(printable(data.name))},</p>
                <p style="margin:0 0 16px 0;">
                  Thank you for reaching out to us! We’ve received your enquiry and our team is currently reviewing it.
                  We will get back to you as soon as possible with the information or assistance you requested.
                </p>
                <p style="margin:0 0 16px 0;">
                  If you have any urgent questions or need further assistance, feel free to reply to this email
                  or contact us at +91-98185-60331.
                </p>
                <p style="margin:0 0 20px 0;">
                  We appreciate your interest and look forward to assisting you soon!
                </p>
                <p style="margin:0;">
                  Best regards,<br/><br/>
                  Education Malaysia<br/><br/>
                  info@educationmalaysia.in<br/>
                  educationmalaysia.in<br/><br/>
                  Our mailing address is:<br/>
                  B-16 ground floor Gurugram, Mayfield Garden,<br/>
                  Sector 50, Gurugram
                </p>
              </td>
            </tr>
            <tr>
              <td style="height:26px;background:#e24886;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `.trim();
}

export async function sendLeadEmail(data: LeadEmailData): Promise<void> {
  const clean: LeadEmailData = {
    ...data,
    name: printable(data.name),
    email: printable(data.email),
    phone: printable(data.phone),
    nationality: printable(data.nationality),
    university: printable(data.university),
    sourceUrl: printable(data.sourceUrl),
  };

  await sendMail({
    to: ADMIN_TO,
    cc: ADMIN_CC,
    bcc: ADMIN_BCC,
    subject: buildAdminSubject(clean),
    html: adminTemplate(clean),
    priority: 'high',
  });

  if (clean.email && clean.email !== 'N/A') {
    await sendMail({
      to: clean.email,
      toName: clean.name !== 'N/A' ? clean.name : undefined,
      subject: buildUserSubject(clean),
      html: userTemplate(clean),
      priority: 'high',
    });
  }
}

