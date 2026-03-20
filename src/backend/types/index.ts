// ============================================================
// SHARED TYPES
// ============================================================

/** Standard API response shape matching old Laravel format */
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

/** SEO meta block returned in every content endpoint */
export interface SeoMeta {
  meta_title: string;
  meta_keyword: string;
  meta_description: string;
  og_image_path?: string | null;
  seo_rating?: string;
  page_content?: string;
}

/** Student (Lead) stored in the `leads` table */
export interface Student {
  id: number;
  name: string;
  website: string;
  email: string | null;
  c_code?: string | null;
  country_code?: string | null;
  mobile?: string | null;
  password?: string | null;
  father?: string | null;
  father_mobile?: string | null;
  mother?: string | null;
  mother_mobile?: string | null;
  gender?: string | null;
  dob?: Date | null;
  nationality?: string | null;
  first_language?: string | null;
  marital_status?: string | null;
  passport_number?: string | null;
  passport_expiry?: Date | null;
  identification_number?: string | null;
  home_address?: string | null;
  home_contact_number?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: number | null;
  country_of_education?: string | null;
  highest_level_of_education?: string | null;
  grading_scheme?: string | null;
  grade_average?: string | null;
  interested_course_category?: string | null;
  interested_level?: string | null;
  interested_program?: string | null;
  intrested_university?: string | null;
  university_id?: number | null | bigint;
  status: boolean | null | number;
  email_verify: boolean | number;
  otp?: string | null;
  otp_expire_at?: Date | null;
  lead_type: string;
  lead_status: string;
  created_at?: Date | null;
  updated_at?: Date | null;

  // English Exam Scores
  english_exam_type?: string | null;
  date_of_exam?: Date | null;
  listening_score?: string | null;
  reading_score?: string | null;
  writing_score?: string | null;
  speaking_score?: string | null;
  overall_score?: string | null;

  // Standardized Tests
  gre?: number | boolean | null;
  gre_exam_date?: Date | null;
  gre_v_score?: string | null;
  gre_v_rank?: string | null;
  gre_q_score?: string | null;
  gre_q_rank?: string | null;
  gre_w_score?: string | null;
  gre_w_rank?: string | null;

  gmat?: number | boolean | null;
  gmat_exam_date?: Date | null;
  gmat_v_score?: string | null;
  gmat_v_rank?: string | null;
  gmat_q_score?: string | null;
  gmat_q_rank?: string | null;
  gmat_w_score?: string | null;
  gmat_w_rank?: string | null;
  gmat_ir_score?: string | null;
  gmat_ir_rank?: string | null;
  gmat_total_score?: string | null;
  gmat_total_rank?: string | null;

  sat?: number | boolean | null;
  sat_exam_date?: Date | null;
  sat_reasoning_point?: string | null;
  sat_subject_point?: string | null;

  // Background Info
  refused_visa?: string | null;
  valid_study_permit?: string | null;
  visa_note?: string | null;
}

/** Student School record */
export interface StudentSchool {
  id: number;
  std_id: number;
  country_of_institution: string;
  name_of_institution: string;
  level_of_education: string;
  primary_language_of_instruction: string;
  attended_institution_from: string;
  attended_institution_to: string;
  degree_name: string;
  graduated_from_this: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
}

/** Student Document record */
export interface StudentDocument {
  id: number;
  std_id: number;
  doc_name: string;
  imgname: string;
  imgpath: string;
  upload_source: string;
}

/** Authenticated request context injected by auth middleware */
export interface AuthenticatedContext {
  student: Student;
}

/** JWT payload shape */
export interface JwtPayload {
  sub: number;   // student id
  email: string;
  iat?: number;
  exp?: number;
}

/** Lead auto-assign  */
export interface LeadAssignment {
  leadId: number;
}

/** Inquiry form data — common fields */
export interface InquiryPayload {
  name: string;
  email: string;
  country_code: string;
  mobile: string;
  source: string;
  source_path: string;
  nationality?: string;
  university?: string | null;
  program?: string | null;
  interest?: string | null;
}

/** Pagination meta */
export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}
