import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// ============================================================
// EMAIL SENDER
// Wraps Nodemailer with the same SMTP config as Laravel.
// Used by all inquiry forms, OTP flow, and password reset.
// ============================================================

let _transporter: nodemailer.Transporter | null = null;

function buildTransporter(config?: { port?: number; secure?: boolean; requireTLS?: boolean }): nodemailer.Transporter {
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

  const transportOptions: SMTPTransport.Options = {
    host,
    port: config?.port ?? port,
    secure: config?.secure ?? secure,
    requireTLS: config?.requireTLS ?? (!secure && encryption === 'tls'),
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  return nodemailer.createTransport(transportOptions);

}

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;
  _transporter = buildTransporter();
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

  const sendWithTransport = async (transporter: nodemailer.Transporter) => {
    await transporter.sendMail(payload);
  };

  try {
    await sendWithTransport(getTransporter());
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
      // retry with a fresh transporter
      resetTransporter();
      try {
        await sendWithTransport(getTransporter());
        return;
      } catch {
        // fallback across common SMTP modes (SSL 465 <-> STARTTLS 587)
        const fallbackPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587) === 465 ? 587 : 465;
        const fallbackSecure = fallbackPort === 465;
        const fallbackTransporter = buildTransporter({
          port: fallbackPort,
          secure: fallbackSecure,
          requireTLS: !fallbackSecure,
        });
        await sendWithTransport(fallbackTransporter);
        try {
          fallbackTransporter.close();
        } catch {
          // noop
        }
        return;
      }
    }

    // Generic one-time retry with a fresh transporter to handle stale pooled state.
    resetTransporter();
    await sendWithTransport(getTransporter());
    return;
  }
}
