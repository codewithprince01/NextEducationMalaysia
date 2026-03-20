import { z } from 'zod';

// ============================================================
// AUTH VALIDATORS
// Zod schemas for student authentication flows.
// ============================================================

export const studentRegisterSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  country_code: z.string().optional(),
  mobile: z.string().min(5, 'Mobile number is too short').optional(),
  nationality: z.string().optional(),
  website: z.string().default('MYS'),
});

export const studentLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  website: z.string().default('MYS'),
});

export const otpVerifySchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
