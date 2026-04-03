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

  if (p.includes('/libia')) return 'Libia Landing Page';
  if (p.includes('/zambia')) return 'Zambia Landing Page';
  if (p.startsWith('/university/')) return 'University Profile Page';
  if (p.startsWith('/scholarships') || p.startsWith('/scholarship')) return 'Scholarship Page';
  if (p.startsWith('/blog')) return 'Blog Page';
  if (p.startsWith('/specialization')) return 'Specialization Page';
  if (p.startsWith('/courses-in-malaysia') || p.startsWith('/course/') || p.startsWith('/courses')) return 'Course Category Page';
  if (p.startsWith('/resources/exams') || p.startsWith('/exams') || p.startsWith('/exam')) return 'Exam Page';
  if (p.startsWith('/resources/services') || p.startsWith('/services') || p.startsWith('/service')) return 'Service Page';
  if (p.startsWith('/contact-us')) return 'Contact Us Page';
  if (p === '/' || p.startsWith('/?')) return 'Modal Form';
  return 'Website Page';
}

function inferSourceLabel(input: BuildLeadSourceInput, sourcePath: string): string {
  const request = cleanText(input.requestfor).toLowerCase();
  const formType = cleanText(input.formType).toLowerCase();
  const source = cleanText(input.source).toLowerCase();
  const candidate = `${formType} ${source}`.trim();
  const pageLabel = inferPageLabel(sourcePath);

  const allowed = new Set([
    'University Profile Page',
    'Specialization Page',
    'Course Category Page',
    'Exam Page',
    'Libia Landing Page',
    'Service Page',
    'Blog Page',
    'Modal Form',
    'Zambia Landing Page',
    'Scholarship Page',
    'Contact Us Page',
  ]);

  // If this is a specific content page, keep source as page label (do not override by request type).
  if (allowed.has(pageLabel) && pageLabel !== 'Modal Form' && pageLabel !== 'Contact Us Page') {
    return pageLabel;
  }

  if (request === 'signup' || candidate.includes('signup') || candidate.includes('sign up')) return 'Signup';
  if (request === 'counselling' || request === 'book-session' || candidate.includes('book session')) return 'Book Session';
  if (candidate.includes('modal') || candidate.includes('malaysia calling') || candidate.includes('popup')) return 'Modal Form';
  if (request === 'brochure' || candidate.includes('brochure')) return 'Brochure Request';
  if (request === 'fees' || request === 'fee' || request === 'fee_structure' || candidate.includes('fee')) return 'Fees Request';
  if (candidate.includes('contact') || candidate.includes('get in touch')) return 'Contact Us Page';

  return allowed.has(pageLabel) ? pageLabel : 'Contact Us Page';
}

export function buildLeadSource(input: BuildLeadSourceInput): { source: string; source_path: string } {
  const source_path = normalizeLeadSourcePath(input.sourceUrl || input.sourcePath || '/');
  const label = inferSourceLabel(input, source_path);
  const merged = `Education Malaysia - ${label}`.slice(0, 180);
  return {
    source: merged,
    source_path,
  };
}
