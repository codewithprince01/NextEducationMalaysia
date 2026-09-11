// ============================================================
// BACKEND CONFIG — CONSTANTS
// Mirrors Laravel helper.php constants exactly.
// Source-of-truth for all backend modules.
// ============================================================

export const SITE_VAR = 'MYS' as const;
export const DOMAIN = 'educationmalaysia.in' as const;
export const IMAGE_DOMAIN = 'https://www.images.britannicaoverseas.com/em' as const;
export const SITE_URL = `https://www.${DOMAIN}` as const;

export const CONTACT = {
  EMAIL: 'info@educationmalaysia.in',
  PHONE: '+91-98185-60331',
} as const;

/** Inquiry email routing — mirrors TO_EMAIL, CC_EMAIL, BCC_EMAIL in helper.php */
export const MAIL_RECIPIENTS = {
  TO_EMAIL: 'studytutelage@gmail.com',
  TO_NAME: 'Team tutelage Study',
  CC_EMAIL: 'vandana@educationmalaysia.in',
  CC_NAME: 'Vandana Sarswat',
  BCC_EMAIL: 'farazahmad280@gmail.com',
  BCC_NAME: 'Mohd Faraz',
} as const;

export const RECAPTCHA = {
  SITE_KEY: '6Lf6t2wpAAAAACTIO7byB8-ucDBfIssDXcxD3PAr',
  SECRET_KEY: '6Lf6t2wpAAAAAO39ZjeGK4-APTubxFFWR5Thi1ZD',
} as const;

export const AUTH = {
  TOKEN_NAME: 'StudentAPIToken',
  /** JWT expiry in seconds (7 days) */
  JWT_EXPIRY: 60 * 60 * 24 * 7,
  OTP_EXPIRY_MINUTES: 15,
  RESET_TOKEN_EXPIRY_MINUTES: 30,
} as const;

export const LEAD_SOURCE = {
  SIGNUP: 'Education Malaysia - Signup',
  MODAL_FORM: 'Education Malaysia - Modal Form',
  UNIVERSITY_PROFILE: 'Education Malaysia - University Profile Page',
  BROCHURE_REQUEST: 'Education Malaysia - Brochure Request',
  FEES_REQUEST: 'Education Malaysia - Fees Request',
  CONTACT_US: 'Contact-us - Education Malaysia',
  EXAM_PAGE: 'Education Malaysia - Exam Page',
  BOOK_SESSION: 'Education Malaysia - Book Session',
} as const;
