import nodemailer from 'nodemailer';

// ============================================================
// EMAIL SENDER
// Wraps Nodemailer with the same SMTP config as Laravel.
// Used by all inquiry forms, OTP flow, and password reset.
// ============================================================

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
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
}

/**
 * Sends an email via Nodemailer.
 * Throws on failure so callers can catch and return 500.
 */
export async function sendMail(options: MailOptions): Promise<void> {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME ?? 'Education Malaysia';
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? '';

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
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
  });
}
