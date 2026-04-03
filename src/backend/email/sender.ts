import nodemailer from 'nodemailer';

// ============================================================
// EMAIL SENDER
// Wraps Nodemailer with the same SMTP config as Laravel.
// Used by all inquiry forms, OTP flow, and password reset.
// ============================================================

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USERNAME;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
  const encryption = (process.env.SMTP_ENCRYPTION || process.env.MAIL_ENCRYPTION || '').toLowerCase();
  const explicitSecure = process.env.SMTP_SECURE || process.env.MAIL_SECURE;
  const secure =
    explicitSecure != null && explicitSecure !== ''
      ? explicitSecure === 'true' || explicitSecure === '1'
      : port === 465 || encryption === 'ssl' || encryption === 'smtps';

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    requireTLS: !secure && encryption === 'tls',
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return _transporter;
}

function resetTransporter() {
  try {
    _transporter?.close();
  } catch {
    // ignore close errors
  }
  _transporter = null;
}

export interface MailOptions {
  to: string;
  toName?: string;
  cc?: string;
  ccName?: string;
  bcc?: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
  /** Priority 1 = high (matches Laravel ->priority(1)) */
  priority?: 'high' | 'normal' | 'low';
  /** Optional override for SMTP envelope/header From email */
  fromEmail?: string;
  /** Optional override for display name in From header */
  fromName?: string;
  /** Optional reply-to override */
  replyTo?: string;
}

/**
 * Sends an email via Nodemailer.
 * Throws on failure so callers can catch and return 500.
 */
export async function sendMail(options: MailOptions): Promise<void> {
  const defaultFromName =
    options.fromName ??
    process.env.SMTP_FROM_NAME ??
    process.env.MAIL_FROM_NAME ??
    'Education Malaysia';
  const configuredFromEmail =
    options.fromEmail ??
    process.env.SMTP_FROM_EMAIL ??
    process.env.MAIL_FROM ??
    process.env.MAIL_FROM_ADDRESS ??
    '';
  const smtpAuthEmail =
    process.env.SMTP_USER ??
    process.env.MAIL_USERNAME ??
    '';
  // For best deliverability, prefer authenticated mailbox as envelope/header sender.
  const effectiveFromEmail = options.fromEmail || smtpAuthEmail || configuredFromEmail;
  const replyToEmail =
    options.replyTo ||
    (configuredFromEmail && configuredFromEmail !== effectiveFromEmail ? configuredFromEmail : undefined);

  const payload = {
    from: `"${defaultFromName}" <${effectiveFromEmail}>`,
    replyTo: replyToEmail,
    to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
    cc: options.cc
      ? options.ccName
        ? `"${options.ccName}" <${options.cc}>`
        : options.cc
      : undefined,
    bcc: options.bcc,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
    priority: options.priority ?? 'high',
  };

  try {
    await getTransporter().sendMail(payload);
  } catch (error: any) {
    const message = String(error?.message || '').toLowerCase();
    const code = String(error?.code || '').toUpperCase();
    const looksLikeFromRejection =
      message.includes('sender') ||
      message.includes('from address') ||
      message.includes('not owned by user') ||
      message.includes('mail from');
    const looksLikeConnectionIssue =
      code.includes('ETIMEDOUT') ||
      code.includes('ECONNECTION') ||
      code.includes('ESOCKET') ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('connection');

    if (looksLikeFromRejection && smtpAuthEmail && smtpAuthEmail !== effectiveFromEmail) {
      await getTransporter().sendMail({
        ...payload,
        from: `"${defaultFromName}" <${smtpAuthEmail}>`,
      });
      return;
    }

    if (looksLikeConnectionIssue) {
      // retry once with a fresh transporter (helps after stale SMTP sockets)
      resetTransporter();
      await getTransporter().sendMail(payload);
      return;
    }

    // Generic one-time retry with a fresh transporter to handle stale pooled state.
    resetTransporter();
    await getTransporter().sendMail(payload);
    return;
  }
}
