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

function isLikelyEmail(value?: string | null): boolean {
  if (!value) return false;
  const v = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function inferRequestLabel(formType?: string | null): string {
  const t = String(formType || '').toLowerCase();
  if (t.includes('brochure')) return 'Brochure';
  if (t.includes('enquiry') || t.includes('inquiry')) return 'Enquiry';
  if (t.includes('fee')) return 'Fee Structure';
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
  const formType = String(data.formType || '').toLowerCase();

  if (formType.includes('contact') || formType.includes('get in touch')) {
    return uni 
      ? `Thank You for Contacting Education Malaysia regarding ${uni}`
      : 'Thank You for Contacting Education Malaysia - We Have Received Your Message';
  }
  if (formType.includes('counselling') || formType.includes('book session')) {
    return uni
      ? `Counselling Request for ${uni} - Education Malaysia`
      : 'Thank You for Your Counselling Request - Education Malaysia';
  }
  if (formType.includes('fee')) {
    return uni
      ? `Fee Structure Enquiry for ${uni} - Education Malaysia`
      : 'Thank You for Your Fee Enquiry - Education Malaysia';
  }
  if (formType.includes('brochure')) {
    return uni
      ? `Brochure Request for ${uni} - Education Malaysia`
      : 'Thank You for Your Brochure Request - Education Malaysia';
  }
  if (formType.includes('partner')) {
    return 'Thank You for Your Partner Application - Education Malaysia';
  }
  if (uni) {
    return `Thank You for Contacting Education Malaysia regarding ${uni}`;
  }
  return 'Thank You for Contacting Education Malaysia - We Have Received Your Request';
}

function adminTemplate(data: LeadEmailData): string {
  const headline = buildAdminSubject(data);
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
    highest_qualification: 'Education Level',
    interested_course_category: 'Interested Course Category',
    interested_program: 'Interested Program',
    message: 'Message',
    source: 'Lead Source',
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
    'Lead Source',
    'Message',
    'Source Path',
    'Country Code',
    'Education Level',
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
                <p style="margin:0 0 26px 0;"><strong>${escapeHtml(headline)}</strong></p>
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
  const uni = String(data.university || '').trim();

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Thank You for Contacting Education Malaysia</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="650" cellspacing="0" cellpadding="0" style="max-width:650px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
            <!-- Header -->
            <tr>
              <td align="center" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:28px 24px;">
                <h1 style="margin:0;color:#ffffff;font-size:32px;letter-spacing:-0.5px;font-weight:800;">Education Malaysia</h1>
                <p style="margin:6px 0 0 0;color:#bfdbfe;font-size:14px;font-weight:500;">Your Gateway to Premier Higher Education in Malaysia</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding:36px 36px 28px 36px;font-size:15px;line-height:1.7;color:#334155;">
                <p style="margin:0 0 16px 0;font-size:17px;font-weight:700;color:#0f172a;">Dear ${escapeHtml(printable(data.name))},</p>
                <p style="margin:0 0 16px 0;">
                  Thank you for reaching out to <strong>Education Malaysia</strong>! We have received your inquiry${uni ? ` regarding <strong>${escapeHtml(uni)}</strong>` : ''} and our academic counseling team is currently reviewing your details.
                </p>
                
                <div style="background:#f1f5f9;border-left:4px solid #2563eb;border-radius:6px;padding:16px 20px;margin:24px 0;">
                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#1e293b;">What Happens Next?</p>
                  <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                    One of our dedicated educational advisors will contact you shortly to provide detailed information about courses, tuition fees, eligibility requirements, and scholarship opportunities.
                  </p>
                </div>

                <p style="margin:0 0 16px 0;">
                  If you have any urgent questions or wish to speak with our admission advisors right away, please feel free to reply to this email or connect with us:
                </p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 24px 0;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#334155;">
                      <strong>📞 Phone / WhatsApp:</strong> +60 11-2137 6171 / +91 98185 60331
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#334155;">
                      <strong>✉️ Email:</strong> <a href="mailto:info@educationmalaysia.in" style="color:#2563eb;text-decoration:none;font-weight:600;">info@educationmalaysia.in</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#334155;">
                      <strong>🌐 Website:</strong> <a href="https://www.educationmalaysia.in" style="color:#2563eb;text-decoration:none;font-weight:600;">www.educationmalaysia.in</a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0 0;font-size:14px;color:#64748b;">
                  Warm regards,<br/>
                  <strong style="color:#0f172a;font-size:15px;">Admissions & Student Advisory Team</strong><br/>
                  <span style="color:#2563eb;font-weight:600;">Education Malaysia</span>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#0f172a;padding:20px 36px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.5;">
                <p style="margin:0 0 4px 0;">&copy; ${new Date().getFullYear()} Education Malaysia. All rights reserved.</p>
                <p style="margin:0;">B-16 Ground Floor, Mayfield Garden, Sector 50, Gurugram, India</p>
              </td>
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
  const normalizeOptional = (value?: string | null): string | null => {
    const v = String(value ?? '').trim();
    return v && v.toLowerCase() !== 'n/a' ? v : null;
  };

  const clean: LeadEmailData = {
    ...data,
    name: printable(data.name),
    email: printable(data.email),
    phone: printable(data.phone),
    nationality: normalizeOptional(data.nationality),
    university: normalizeOptional(data.university),
    sourceUrl: normalizeOptional(data.sourceUrl) || '/',
  };

  let adminError: unknown = null;
  let userError: unknown = null;

  const adminSubject = buildAdminSubject(clean);
  const adminHtml = adminTemplate(clean);
  const adminTask = sendMail({
    to: ADMIN_TO,
    cc: ADMIN_CC,
    bcc: ADMIN_BCC,
    subject: adminSubject,
    html: adminHtml,
    priority: 'high',
  }).catch(async (error) => {
    adminError = error;
    console.error('[LeadEmail] Admin email failed:', error);
    // Fallback: deliver to each admin recipient separately so one bad header never blocks all.
    try {
      await Promise.allSettled([
        sendMail({ to: ADMIN_TO, subject: adminSubject, html: adminHtml, priority: 'high' }),
        sendMail({ to: ADMIN_CC, subject: adminSubject, html: adminHtml, priority: 'high' }),
        sendMail({ to: ADMIN_BCC, subject: adminSubject, html: adminHtml, priority: 'high' }),
      ]);
      adminError = null;
    } catch (fallbackErr) {
      adminError = fallbackErr;
      console.error('[LeadEmail] Admin fallback delivery failed:', fallbackErr);
    }
  });

  const userExpected = isLikelyEmail(clean.email) && clean.email !== 'N/A';
  const userTask = userExpected
    ? sendMail({
        to: String(clean.email).trim(),
        toName: clean.name !== 'N/A' ? clean.name : undefined,
        subject: buildUserSubject(clean),
        html: userTemplate(clean),
        priority: 'high',
      }).catch((error) => {
        userError = error;
        console.error('[LeadEmail] User email failed:', error);
      })
    : Promise.resolve();

  await Promise.allSettled([adminTask, userTask]);

  const adminDelivered = !adminError;
  const userDelivered = userExpected ? !userError : true;

  if (!adminDelivered && !userDelivered) {
    const adminMsg = adminError ? String((adminError as any)?.message || adminError) : '';
    const userMsg = userError ? String((userError as any)?.message || userError) : '';
    // Do not block form submissions if SMTP is temporarily unavailable.
    // Lead data is already stored in DB by the caller before this function runs.
    console.error(
      `[LeadEmail] Email dispatch failed${adminMsg ? ` [admin: ${adminMsg}]` : ''}${userMsg ? ` [user: ${userMsg}]` : ''}`
    );
  }
}

