import { prisma } from '@/lib/db';
import {
  StudentRegisterInput,
  StudentLoginInput,
  OtpVerifyInput,
  ResetPasswordInput,
} from '../validators/auth';
import { hashPassword, verifyPassword, generateOtp } from '../utils/auth';
import { sendMail } from '../email/sender';
import { otpEmailHtml } from '../email/templates/otp';
import { forgotPasswordLinkEmailHtml } from '../email/templates/forgot-password-link';
import { issueToken } from '../middleware/auth';
import { ApiResponse } from '../types';
import { serializeBigInt } from '@/lib/utils';
import crypto from 'crypto';

const SITE_VAR = process.env.SITE_VAR || 'MYS';

type LeadRow = {
  id: bigint | number;
  name: string | null;
  email: string | null;
  password: string | null;
  otp: number | null;
  otp_expire_at: Date | string | null;
  email_verify: number | boolean | null;
  status: number | boolean | null;
  login_count?: number | null;
  [key: string]: any;
};

export class StudentAuthService {
  private static instance: StudentAuthService;

  private constructor() {}

  static getInstance(): StudentAuthService {
    if (!StudentAuthService.instance) {
      StudentAuthService.instance = new StudentAuthService();
    }
    return StudentAuthService.instance;
  }

  private async findLeadByEmail(email: string): Promise<LeadRow | null> {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM leads WHERE email = ? AND website = ? LIMIT 1',
      email,
      SITE_VAR,
    )) as LeadRow[];
    return rows[0] ?? null;
  }

  private async findLeadById(id: number): Promise<LeadRow | null> {
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM leads WHERE id = ? AND website = ? LIMIT 1',
      id,
      SITE_VAR,
    )) as LeadRow[];
    return rows[0] ?? null;
  }

  async register(input: StudentRegisterInput): Promise<ApiResponse> {
    const existing = await this.findLeadByEmail(input.email);
    if (existing && Number(existing.email_verify || 0) === 1) {
      return { status: false, message: 'Email already registered and verified. Please log in.' };
    }

    const otp = generateOtp();
    const hashedPassword = await hashPassword(input.password);

    if (existing) {
      await prisma.$executeRawUnsafe(
        `UPDATE leads
         SET name = ?, password = ?, country_code = ?, mobile = ?, nationality = ?,
             highest_qualification = ?, interested_course_category = ?,
             otp = ?, otp_expire_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), email_verify = 0, email_verified = 0,
             registered = 0, status = 0, lead_type = 'new', lead_status = 'Fresh',
             source = 'Education Malaysia - Signup', source_path = ?, updated_at = NOW()
         WHERE id = ?`,
        input.name,
        hashedPassword,
        input.country_code || null,
        input.mobile || null,
        input.nationality || null,
        input.highest_qualification || null,
        input.interested_course_category || null,
        otp,
        input.source_path || null,
        Number(existing.id),
      );
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO leads
         (name, website, email, country_code, mobile, password, nationality,
          highest_qualification, interested_course_category, otp, otp_expire_at,
          email_verify, email_verified, registered, status, lead_type, lead_status,
          source, source_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0, 0, 0, 0, 'new', 'Fresh',
                 'Education Malaysia - Signup', ?, NOW(), NOW())`,
        input.name,
        input.website || SITE_VAR,
        input.email,
        input.country_code || null,
        input.mobile || null,
        hashedPassword,
        input.nationality || null,
        input.highest_qualification || null,
        input.interested_course_category || null,
        otp,
        input.source_path || null,
      );
    }

    const saved = await this.findLeadByEmail(input.email);

    void sendMail({
      to: input.email,
      toName: input.name,
      subject: 'Your Verification Code - Education Malaysia',
      html: otpEmailHtml(input.name, otp),
    }).catch((err) => console.error('Failed to send OTP email:', err));

    return {
      status: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        id: saved ? Number(saved.id) : null,
        email: input.email,
      } as any,
    };
  }

  async verifyOtp(input: OtpVerifyInput): Promise<ApiResponse<{ token: string; student: any }>> {
    const student = input.id
      ? await this.findLeadById(Number(input.id))
      : await this.findLeadByEmail(String(input.email || ''));

    if (!student) {
      return { status: false, message: 'Student record not found.' };
    }

    if (Number(student.otp || 0) !== Number(String(input.otp).trim())) {
      return { status: false, message: 'Invalid OTP code.' };
    }
    const validRows = (await prisma.$queryRawUnsafe(
      `SELECT id FROM leads
       WHERE id = ? AND otp = ? AND otp_expire_at IS NOT NULL AND otp_expire_at >= NOW()
       LIMIT 1`,
      Number(student.id),
      Number(String(input.otp).trim()),
    )) as Array<{ id: number | bigint }>;
    if (!validRows.length) {
      return { status: false, message: 'OTP has expired. Please request a new one.' };
    }

    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET email_verify = 1, email_verified = 1, registered = 1, status = 1,
           otp = NULL, otp_expire_at = NULL, email_verified_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      Number(student.id),
    );

    const updated = await this.findLeadById(Number(student.id));
    const token = issueToken({ id: Number(student.id), email: updated?.email ?? '' });

    return {
      status: true,
      message: 'Email verified successfully.',
      data: {
        token,
        id: Number(student.id),
        email: updated?.email,
        student: serializeBigInt(updated),
      } as any,
    };
  }

  async login(input: StudentLoginInput): Promise<ApiResponse<{ token: string; student: any }>> {
    const student = await this.findLeadByEmail(input.email);
    if (!student) {
      return { status: false, message: 'Invalid email or password.' };
    }

    const verified = Number(student.email_verify || 0) === 1;
    const active = Number(student.status || 0) === 1;
    if (!verified || !active) {
      const otp = generateOtp();
      await prisma.$executeRawUnsafe(
        'UPDATE leads SET otp = ?, otp_expire_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), updated_at = NOW() WHERE id = ?',
        otp,
        Number(student.id),
      );
      void sendMail({
        to: student.email || '',
        toName: student.name || 'Student',
        subject: 'Your OTP Code - Education Malaysia',
        html: otpEmailHtml(student.name || 'Student', otp),
      }).catch((err) => console.error('Failed to send OTP email on unverified login:', err));
      return {
        status: true,
        message: 'Account not verified. Please verify your email. OTP sent to your email.',
        data: {
          id: Number(student.id),
          email: student.email,
          otp_required: true,
          needs_otp: true,
        } as any,
      };
    }

    const storedPassword = student.password ?? '';
    const isMatch = (await verifyPassword(input.password, storedPassword)) || input.password === storedPassword;
    if (!isMatch) {
      return { status: false, message: 'Invalid email or password.' };
    }

    await prisma.$executeRawUnsafe(
      'UPDATE leads SET login_count = COALESCE(login_count, 0) + 1, last_login = NOW(), updated_at = NOW() WHERE id = ?',
      Number(student.id),
    );

    const token = issueToken({ id: Number(student.id), email: student.email ?? '' });
    const latest = await this.findLeadById(Number(student.id));

    return {
      status: true,
      message: 'Logged in successfully.',
      data: {
        token,
        id: Number(student.id),
        email: student.email,
        student: serializeBigInt(latest),
      } as any,
    };
  }

  async resendOtp(identifier: string | number): Promise<ApiResponse> {
    const student =
      typeof identifier === 'number'
        ? await this.findLeadById(Number(identifier))
        : await this.findLeadByEmail(identifier);

    if (!student) {
      return { status: false, message: 'Email not found.' };
    }

    const otp = generateOtp();

    await prisma.$executeRawUnsafe(
      'UPDATE leads SET otp = ?, otp_expire_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE), updated_at = NOW() WHERE id = ?',
      otp,
      Number(student.id),
    );

    void sendMail({
      to: student.email || '',
      toName: student.name || 'Student',
      subject: 'Your New Verification Code - Education Malaysia',
      html: otpEmailHtml(student.name || 'Student', otp),
    }).catch((err) => console.error('Failed to send resend OTP email:', err));

    return {
      status: true,
      message: 'A new OTP has been sent to your email.',
    };
  }

  async forgotPassword(email: string, baseUrl?: string): Promise<ApiResponse> {
    const student = await this.findLeadByEmail(email);
    if (!student) {
      return { status: false, message: 'Entered wrong email address. Please check.' };
    }

    const rememberToken = crypto.randomBytes(24).toString('hex');
    const siteUrl = (baseUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetPath = `/password/reset?uid=${Number(student.id)}&token=${rememberToken}`;
    const resetLink = `${siteUrl}${resetPath}`;
    const loginLink = `${siteUrl}/login`;

    await prisma.$executeRawUnsafe(
      'UPDATE leads SET remember_token = ?, otp_expire_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE), updated_at = NOW() WHERE id = ?',
      rememberToken,
      Number(student.id),
    );
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    void sendMail({
      to: student.email || '',
      toName: student.name || 'Student',
      subject: 'Password Reset',
      html: forgotPasswordLinkEmailHtml({
        name: student.name || 'Student',
        resetPasswordLink: resetLink,
        loginLink,
      }),
    }).catch((err) => console.error('Failed to send password reset link email:', err));

    return {
      status: true,
      message: 'Password reset email sent successfully.',
      data: {
        email,
        reset_link: resetLink,
        token_expiry: tokenExpiry.toISOString(),
      } as any,
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<ApiResponse> {
    const student = await this.findLeadById(Number(input.uid));
    if (!student) {
      return { status: false, message: 'Invalid password reset link.' };
    }

    if ((student.remember_token || '') !== input.token) {
      return { status: false, message: 'Invalid password reset link.' };
    }

    const validRows = (await prisma.$queryRawUnsafe(
      `SELECT id FROM leads
       WHERE id = ? AND remember_token = ? AND otp_expire_at IS NOT NULL AND otp_expire_at >= NOW()
       LIMIT 1`,
      Number(student.id),
      String(input.token),
    )) as Array<{ id: number | bigint }>;
    if (!validRows.length) {
      return { status: false, message: 'This reset link has expired. Please request a new one.' };
    }

    const hashedPassword = await hashPassword(input.new_password);

    await prisma.$executeRawUnsafe(
      `UPDATE leads
       SET password = ?, remember_token = NULL, otp = NULL, otp_expire_at = NULL,
           email_verify = 1, email_verified = 1, status = 1,
           login_count = COALESCE(login_count, 0) + 1, last_login = NOW(), updated_at = NOW()
       WHERE id = ?`,
      hashedPassword,
      Number(student.id),
    );

    return { status: true, message: 'Password reset successful. You are now logged in.' };
  }
}

export const studentAuthService = StudentAuthService.getInstance();
