type BuildLeadSourceInput = {
  formType?: string | null;
  source?: string | null;
  requestfor?: string | null;
  sourceUrl?: string | null;
  sourcePath?: string | null;
};

function cleanText(value: unknown, max = 180): string {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

export function normalizeLeadSourcePath(raw: unknown): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://www.educationmalaysia.in';
  const input = cleanText(raw, 500);
  try {
    const url = new URL(input || '/', base);
    const normalized = `${url.origin}${url.pathname || '/'}${url.search || ''}` || `${url.origin}/`;
    return normalized.slice(0, 240);
  } catch {
    const fallback = new URL('/', base).toString();
    return fallback.slice(0, 240);
  }
}

function inferPageLabel(path: string): string {
  let p = String(path || '/').toLowerCase();
  try {
    p = new URL(path).pathname.toLowerCase();
  } catch {
    p = p.startsWith('/') ? p : `/${p}`;
  }

  if (p.startsWith('/university/')) return 'University Profile Page';
  if (p.startsWith('/universities')) return 'Universities Page';
  if (p.startsWith('/scholarships')) return 'Scholarship Page';
  if (p.startsWith('/blog')) return 'Blog Page';
  if (p.startsWith('/specialization')) return 'Specialization Page';
  if (p.startsWith('/courses-in-malaysia') || p.startsWith('/course/') || p.startsWith('/courses')) return 'Courses Page';
  if (p.startsWith('/resources/exams')) return 'Exam Page';
  if (p.startsWith('/contact-us')) return 'Contact Us Page';
  if (p.startsWith('/what-people-say') || p.startsWith('/write-a-review')) return 'Review Page';
  if (p === '/' || p.startsWith('/?')) return 'Home Page';
  return 'Website Page';
}

function inferFormLabel(input: BuildLeadSourceInput): string {
  const request = cleanText(input.requestfor).toLowerCase();
  const formType = cleanText(input.formType).toLowerCase();
  const source = cleanText(input.source).toLowerCase();
  const candidate = formType || source;
  if (request === 'fees' || request === 'fee' || request === 'fee_structure') return 'fee structure';
  if (request === 'brochure') return 'brochure';
  if (request === 'counselling' || request === 'book-session') return 'counselling';
  if (request === 'comparison') return 'compare universities';
  if (request === 'apply') return 'apply now';
  if (request === 'signup' || candidate.includes('signup') || candidate.includes('sign up')) return 'signup';

  const normalized = candidate
    .replace(/\b(education malaysia)\b/gi, '')
    .replace(/\brequest\b/gi, '')
    .replace(/[-_:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || 'general inquiry';
}

export function buildLeadSource(input: BuildLeadSourceInput): { source: string; source_path: string } {
  const source_path = normalizeLeadSourcePath(input.sourceUrl || input.sourcePath || '/');
  const formLabel = inferFormLabel(input);
  const pageLabel = inferPageLabel(source_path);
  const merged = `Education Malaysia - ${formLabel} Request - ${pageLabel}`.slice(0, 180);
  return {
    source: merged,
    source_path,
  };
}
