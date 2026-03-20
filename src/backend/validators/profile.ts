import { z } from 'zod';

// ============================================================
// PROFILE VALIDATORS
// Zod schemas for student profile management.
// ============================================================

export const personalInfoSchema = z.object({
  name: z.string().regex(/^[a-zA-Z ]*$/, 'Name should only contain letters and spaces').min(2),
  email: z.string().email(),
  country_code: z.string(),
  mobile: z.string(),
  father: z.string(),
  mother: z.string(),
  dob: z.string().or(z.date()),
  first_language: z.string(),
  nationality: z.string(),
  passport_number: z.string(),
  passport_expiry: z.string().or(z.date()),
  marital_status: z.string(),
  gender: z.string(),
  home_address: z.string(),
  city: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  state: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  country: z.string().regex(/^[a-zA-Z ]*$/).optional(),
  zipcode: z.number().or(z.string()),
  home_contact_number: z.string(),
});

export const eduSummarySchema = z.object({
  country_of_education: z.string(),
  highest_level_of_education: z.string(),
  grading_scheme: z.string(),
  grade_average: z.string().regex(/^[a-zA-Z0-9\s\.\-]+$/),
});

export const schoolSchema = z.object({
  id: z.number().or(z.bigint()).optional(),
  country_of_institution: z.string(),
  name_of_institution: z.string(),
  level_of_education: z.string(),
  primary_language_of_instruction: z.string(),
  attended_institution_from: z.string().or(z.date()),
  attended_institution_to: z.string().or(z.date()),
  degree_name: z.string(),
  graduated_from_this: z.boolean().or(z.number()),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string().or(z.number()),
});

export const testScoreSchema = z.object({
  english_exam_type: z.enum([
    'I dont have this',
    'I will provide this later',
    'TOEFL',
    'IELTS',
    'Duolingo English Test',
    'PTE'
  ]),
  date_of_exam: z.string().or(z.date()).optional(),
  speaking_score: z.string().or(z.number()).optional(),
  listening_score: z.string().or(z.number()).optional(),
  reading_score: z.string().or(z.number()).optional(),
  writing_score: z.string().or(z.number()).optional(),
  overall_score: z.string().or(z.number()).optional(),
});

export const greSchema = z.object({
  gre_exam_date: z.string().or(z.date()),
  gre_v_score: z.number().min(0).max(170),
  gre_v_rank: z.number().min(0).max(100),
  gre_q_score: z.number().min(0).max(170),
  gre_q_rank: z.number().min(0).max(100),
  gre_w_score: z.number().min(0).max(6),
  gre_w_rank: z.number().min(0).max(100),
});

export const gmatSchema = z.object({
  gmat_exam_date: z.string().or(z.date()),
  gmat_v_score: z.number().min(0).max(51),
  gmat_v_rank: z.number().min(0).max(100),
  gmat_q_score: z.number().min(0).max(51),
  gmat_q_rank: z.number().min(0).max(100),
  gmat_w_score: z.number().min(0).max(6),
  gmat_w_rank: z.number().min(0).max(100),
  gmat_ir_score: z.number().min(0).max(8),
  gmat_ir_rank: z.number().min(0).max(100),
  gmat_total_score: z.number().min(200).max(800),
  gmat_total_rank: z.number().min(0).max(100),
});

export const satSchema = z.object({
  sat_exam_date: z.string().or(z.date()),
  sat_reasoning_point: z.number().min(0).max(1600),
  sat_subject_point: z.number().min(0).max(800),
});

export const backgroundInfoSchema = z.object({
  refused_visa: z.enum(['YES', 'NO']),
  valid_study_permit: z.enum(['YES', 'NO']),
  visa_note: z.string().regex(/^[a-zA-Z0-9\s\.\-]+$/),
});

export const documentUploadSchema = z.object({
  document_name: z.string().regex(/^[a-zA-Z0-9\s\.\-]+$/),
  // File validation usually handled in route/middleware for multipart/form-data
});

export const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8),
  confirm_new_password: z.string().min(8),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: "Passwords don't match",
  path: ["confirm_new_password"],
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type EduSummaryInput = z.infer<typeof eduSummarySchema>;
export type SchoolInput = z.infer<typeof schoolSchema>;
export type TestScoreInput = z.infer<typeof testScoreSchema>;
export type GreInput = z.infer<typeof greSchema>;
export type GmatInput = z.infer<typeof gmatSchema>;
export type SatInput = z.infer<typeof satSchema>;
export type BackgroundInfoInput = z.infer<typeof backgroundInfoSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
