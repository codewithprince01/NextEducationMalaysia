import { z } from 'zod';

// ============================================================
// COMMON ZOD VALIDATORS
// Mirrors all recurring Laravel Validator::make() rules.
// Reusable across every inquiry, auth, and profile endpoint.
// ============================================================

// ─── Primitives ───────────────────────────────────────────────────────────────

export const zEmail = z.string().email('Invalid email address.');
export const zName = z
  .string()
  .min(1, 'Name is required.')
  .regex(/^[a-zA-Z ]*$/, 'Name must only contain letters and spaces.');
export const zPhone = z.string().regex(/^\d+$/, 'Must be a valid numeric phone number.');
export const zCountryCode = z.string().regex(/^\d+$/, 'Country code must be numeric.');
export const zPassword = z.string().min(8, 'Password must be at least 8 characters.');
export const zRequired = z.string().min(1, 'This field is required.');
export const zNumeric = z.coerce.number({ message: 'Must be a number.' });
export const zDate = z.string().date('Must be a valid date (YYYY-MM-DD).');

// ─── Inquiry Forms ────────────────────────────────────────────────────────────

/** Shared fields for all inquiry forms — university profile, simple form, contact-us, etc. */
export const inquiryBaseSchema = z.object({
  name: zRequired,
  email: zEmail,
  country_code: zCountryCode,
  mobile: zPhone,
  source_path: zRequired,
});

/** Simple form (most common inquiry) */
export const simpleFormSchema = inquiryBaseSchema.extend({
  source: zRequired,
  nationality: zRequired,
});

/** University profile form */
export const universityProfileFormSchema = inquiryBaseSchema.extend({
  source: zRequired,
  university_id: zNumeric,
  interested_program: zRequired,
});

/** Brochure / fees request form */
export const brochureRequestSchema = inquiryBaseSchema.extend({
  nationality: zRequired,
  highest_qualification: zRequired,
  interested_course_category: zRequired,
  university_id: zNumeric,
  requestfor: zRequired,
});

/** Contact us form */
export const contactUsSchema = inquiryBaseSchema.extend({
  nationality: zRequired,
  message: z.string().min(1).max(1000),
});

/** Exam page inquiry */
export const examPageSchema = inquiryBaseSchema.extend({
  nationality: zRequired,
  interested_program: zRequired,
});

/** Book session form */
export const bookSessionSchema = inquiryBaseSchema.extend({
  highest_qualification: zRequired,
  interested_course_category: zRequired,
  nationality: zRequired,
  dayslot: z.string().optional(),
  timeslot: z.string().optional(),
  time_zone: z.string().optional(),
  message: z.string().optional(),
});

/** Modal form / registration form (creates student account + sends OTP) */
export const modalFormSchema = z.object({
  name: zName,
  email: zEmail,
  country_code: zCountryCode,
  mobile: zPhone,
  highest_qualification: zRequired,
  interested_course_category: zRequired,
  nationality: zRequired,
  source_path: z.string().optional(),
});

// ─── Student Auth ─────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: zName,
    email: zEmail,
    country_code: zCountryCode,
    mobile: zPhone,
    password: zPassword,
    confirm_password: zPassword,
    highest_qualification: zRequired,
    interested_course_category: zRequired,
    nationality: zRequired,
    source_path: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match.',
    path: ['confirm_password'],
  });

export const loginSchema = z.object({
  email: zEmail,
  password: z.string().min(1, 'Password is required.'),
});

export const verifyOtpSchema = z.object({
  id: zNumeric,
  otp: zNumeric,
});

export const resendOtpSchema = z.object({
  id: zNumeric,
});

export const forgetPasswordSchema = z.object({
  email: zEmail,
});

export const emailLoginSchema = z.object({
  uid: zNumeric,
  token: zRequired,
});

export const resetPasswordSchema = z
  .object({
    uid: zNumeric,
    token: zRequired,
    new_password: zPassword,
    confirm_new_password: zPassword,
  })
  .refine((d) => d.new_password === d.confirm_new_password, {
    message: 'Passwords do not match.',
    path: ['confirm_new_password'],
  });

export const changePasswordSchema = z
  .object({
    old_password: zRequired,
    new_password: zPassword,
    confirm_new_password: zPassword,
  })
  .refine((d) => d.new_password === d.confirm_new_password, {
    message: 'Passwords do not match.',
    path: ['confirm_new_password'],
  });

// ─── Student Profile ──────────────────────────────────────────────────────────

export const personalInfoSchema = z.object({
  name: zName,
  email: zEmail,
  country_code: zCountryCode,
  mobile: zPhone,
  father: zRequired,
  mother: zRequired,
  dob: zDate,
  first_language: zRequired,
  nationality: zRequired,
  passport_number: zRequired,
  passport_expiry: zDate,
  marital_status: zRequired,
  gender: zRequired,
  home_address: zRequired,
  city: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  state: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  country: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  zipcode: zRequired,
  home_contact_number: zPhone,
});

export const educationSummarySchema = z.object({
  country_of_education: zRequired,
  highest_level_of_education: zRequired,
  grading_scheme: zRequired,
  grade_average: z.string().regex(/^[a-zA-Z0-9\s.\-]+$/, 'Invalid grade format.'),
});

export const addSchoolSchema = z.object({
  country_of_institution: zRequired,
  name_of_institution: zRequired,
  level_of_education: zRequired,
  primary_language_of_instruction: zRequired,
  attended_institution_from: zRequired,
  attended_institution_to: zRequired,
  degree_name: zRequired,
  graduated_from_this: zRequired,
  address: zRequired,
  city: zRequired,
  state: zRequired,
  zipcode: zRequired,
});

export const reviewSchema = z.object({
  name: zName,
  email: zEmail,
  mobile: zPhone,
  university: zNumeric,
  program: zRequired,
  passing_year: zNumeric,
  review_title: z.string().min(20).max(100),
  description: z.string().min(150),
  rating: zNumeric,
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Parses a Zod schema from a request body, returning validated data or null.
 * Also returns formatted errors ready to pass to apiValidationError().
 */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; errors: null } | { data: null; errors: Record<string, string[]> }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { data: null, errors: { _body: ['Invalid JSON body.'] } };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { data: null, errors };
  }

  return { data: result.data, errors: null };
}
