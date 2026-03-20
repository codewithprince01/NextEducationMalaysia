import { prisma } from '@/lib/db';
import { 
  StudentRegisterInput, 
  StudentLoginInput, 
  OtpVerifyInput,
  ResetPasswordInput 
} from '../validators/auth';
import { hashPassword, verifyPassword, generateOtp } from '../utils/auth';
import { sendMail } from '../email/sender';
import { otpEmailHtml } from '../email/templates/otp';
import { issueToken } from '../middleware/auth';
import { ApiResponse } from '../types';
import { serializeBigInt } from '@/lib/utils';

/**
 * Service to handle student authentication, registration, and OTP flows.
 * Ported from StudentAuthApi.php
 */
export class StudentAuthService {
  private static instance: StudentAuthService;

  private constructor() {}

  static getInstance(): StudentAuthService {
    if (!StudentAuthService.instance) {
      StudentAuthService.instance = new StudentAuthService();
    }
    return StudentAuthService.instance;
  }

  /**
   * Register a new student (Lead).
   * Generates OTP, hashes password, and sends verification email.
   */
  async register(input: StudentRegisterInput): Promise<ApiResponse> {
    const existing = await prisma.leads.findFirst({
      where: { email: input.email },
    });

    if (existing) {
      if (existing.email_verify) {
        return { status: false, message: 'Email already registered and verified. Please log in.' };
      }
    }

    const otp = generateOtp();
    const hashedPassword = await hashPassword(input.password);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const data = {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      country_code: input.country_code,
      mobile: input.mobile,
      nationality: input.nationality,
      website: input.website,
      otp: otp,
      otp_expire_at: otpExpiry.toISOString(),
      email_verify: false,
      status: 1,
      lead_type: 'new',
      lead_status: 'Fresh',
    };

    if (existing) {
      await prisma.leads.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.leads.create({ data });
    }

    // Send OTP Email
    try {
      await sendMail({
        to: input.email,
        toName: input.name,
        subject: 'Your Verification Code - Education Malaysia',
        html: otpEmailHtml(input.name, otp),
      });
    } catch (err) {
      console.error('Failed to send OTP email:', err);
    }

    return { status: 1, message: 'OTP sent to your email. Please verify to complete registration.' };
  }

  /**
   * Verify OTP and activate account.
   */
  async verifyOtp(input: OtpVerifyInput): Promise<ApiResponse<{ token: string; student: any }>> {
    const student = await prisma.leads.findFirst({
      where: { email: input.email },
    });

    if (!student) {
      return { status: false, message: 'Student record not found.' };
    }

    if (student.otp !== Number(input.otp)) {
      return { status: false, message: 'Invalid OTP code.' };
    }

    if (student.otp_expire_at && new Date(student.otp_expire_at) < new Date()) {
      return { status: false, message: 'OTP has expired. Please request a new one.' };
    }

    const updated = await prisma.leads.update({
      where: { id: student.id },
      data: {
        email_verify: true,
        otp: null,
        otp_expire_at: null,
      },
    });

    const token = issueToken({ id: Number(updated.id), email: updated.email ?? '' });

    return {
      status: true,
      message: 'Email verified successfully.',
      data: {
        token,
        student: serializeBigInt(updated),
      },
    };
  }

  /**
   * Login student and return JWT token.
   */
  async login(input: StudentLoginInput): Promise<ApiResponse<{ token: string; student: any }>> {
    const student = await prisma.leads.findFirst({
      where: { email: input.email },
    });

    if (!student) {
      return { status: false, message: 'Invalid email or password.' };
    }

    if (!student.email_verify) {
      return { status: false, message: 'Email not verified. Please verify your email first.' };
    }

    const isMatch = await verifyPassword(input.password, student.password ?? '');
    if (!isMatch) {
      return { status: false, message: 'Invalid email or password.' };
    }

    // Update login count
    await prisma.leads.update({
      where: { id: student.id },
      data: { login_count: (student.login_count ?? 0) + 1 },
    });

    const token = issueToken({ id: Number(student.id), email: student.email ?? '' });

    return {
      status: true,
      message: 'Logged in successfully.',
      data: {
        token,
        student: serializeBigInt(student),
      },
    };
  }

  /**
   * Resend OTP code.
   */
  async resendOtp(email: string): Promise<ApiResponse> {
    const student = await prisma.leads.findFirst({
      where: { email },
    });

    if (!student) {
      return { status: false, message: 'Email not found.' };
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.leads.update({
      where: { id: student.id },
      data: {
        otp: otp,
        otp_expire_at: otpExpiry.toISOString(),
      },
    });

    await sendMail({
      to: student.email!,
      toName: student.name,
      subject: 'Your New Verification Code - Education Malaysia',
      html: otpEmailHtml(student.name, otp),
    });

    return { status: true, message: 'A new OTP has been sent to your email.' };
  }

  /**
   * Handle forgot password request.
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    const student = await prisma.leads.findFirst({
      where: { email },
    });

    if (!student) {
      return { status: false, message: 'Email not found.' };
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.leads.update({
      where: { id: student.id },
      data: {
        otp: otp,
        otp_expire_at: otpExpiry.toISOString(),
      },
    });

    await sendMail({
      to: student.email!,
      toName: student.name,
      subject: 'Password Reset OTP - Education Malaysia',
      html: otpEmailHtml(student.name, otp),
    });

    return { status: true, message: 'OTP for password reset sent to your email.' };
  }

  /**
   * Reset password using OTP.
   */
  async resetPassword(input: ResetPasswordInput): Promise<ApiResponse> {
    const student = await prisma.leads.findFirst({
      where: { email: input.email },
    });

    if (!student || student.otp !== Number(input.otp)) {
      return { status: false, message: 'Invalid OTP or email.' };
    }

    if (student.otp_expire_at && new Date(student.otp_expire_at) < new Date()) {
      return { status: false, message: 'OTP has expired.' };
    }

    const hashedPassword = await hashPassword(input.password);

    await prisma.leads.update({
      where: { id: student.id },
      data: {
        password: hashedPassword,
        otp: null,
        otp_expire_at: null,
        email_verify: true, // Auto-verify if they can reset password
      },
    });

    return { status: true, message: 'Password has been reset successfully. You can now log in.' };
  }
}

export const studentAuthService = StudentAuthService.getInstance();
