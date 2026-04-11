import { z } from 'zod';

// ============================================================
// AUTH VALIDATORS
// Zod schemas for student authentication flows.
// ============================================================

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/\d/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');

export const studentRegisterSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email('Invalid email address'),
  password: strongPassword,
  confirm_password: z.string().optional(),
  country_code: z.string().optional(),
  mobile: z.string().min(5, 'Mobile number is too short').optional(),
  nationality: z.string().optional(),
  highest_qualification: z.string().optional(),
  interested_course_category: z.string().optional(),
  source_path: z.string().optional(),
  website: z.string().default('MYS'),
});

export const studentLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  website: z.string().default('MYS'),
});

export const otpVerifySchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  email: z.string().email('Invalid email address').optional(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
}).refine((data) => Boolean(data.id || data.email), {
  message: 'Either id or email is required',
  path: ['id'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  uid: z.coerce.number().int().positive('Invalid user id'),
  token: z.string().min(10, 'Invalid reset token'),
  new_password: strongPassword,
  confirm_new_password: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ["confirm_new_password"],
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
