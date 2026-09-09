import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

/**
 * Content freshness probe.
 *
 * The heavy page queries are cached for 24h. On their own that means an edit
 * saved in the admin panel stays invisible on the site for up to a day unless
 * somebody remembers to call /api/v1/revalidate by hand.
 *
 * Instead of guessing with a short timer, we ask the database a very cheap
 * question on each request — "what is the newest updated_at, and how many rows
 * are there?" — and feed the answer into the cache key of the expensive
 * queries. Nothing changed => same key => cached result, no extra work.
 * Something changed => new key => the page rebuilds itself on the next request.
 *
 * COUNT(*) is part of the signature because a deleted row lowers the count
 * without moving MAX(updated_at).
 *
 * Cost: one aggregate over a handful of small tables (largest is ~7k rows).
 *
 * The probe deliberately does NOT go through unstable_cache. That cache serves
 * stale entries while it refreshes in the background, which would mean the
 * first page load after an edit still showed the old content and the editor had
 * to refresh twice. React's `cache` only de-duplicates within a single render
 * pass, so the several queries on one page share one probe while every new
 * request sees the current state of the database.
 */

const DOMAIN_TABLES = {
  specialization: [
    'course_specializations',
    'specialization_contents',
    'specialization_levels',
    'specialization_level_contents',
    'course_specialization_faqs',
  ],
  course: [
    'course_categories',
    'course_category_contents',
    'course_category_faqs',
    'university_programs',
    'university_program_contents',
  ],
  university: [
    'universities',
    'university_programs',
    'university_program_contents',
    'university_overviews',
    'university_photos',
    'university_scholarships',
    'institute_types',
    'reviews',
  ],
  scholarship: ['scholarships'],
  blog: ['blogs', 'blog_categories', 'blog_contents', 'blog_faqs'],
  'page-contents': ['page_contents', 'page_banners'],
  home: ['page_banners', 'page_contents', 'faqs', 'universities', 'university_programs'],
  // `exam_tabs` is deliberately absent: it has no `updated_at`, and one column
  // short makes the whole probe throw and fall back to a constant, which would
  // quietly leave exam pages on the 24h timer again.
  exam: ['exams', 'exam_faqs', 'exam_page_contents', 'exam_page_tabs', 'static_page_seos'],
  service: ['services', 'site_pages', 'site_page_tabs', 'page_contents'],
} as const

export type ContentDomain = keyof typeof DOMAIN_TABLES

/**
 * Tables are listed in code (never from user input), so interpolating the
 * names into the SQL is safe — they can't be parameterised anyway.
 */
function buildSignatureQuery(tables: readonly string[]) {
  const parts = tables.map(
    (table) =>
      `SELECT COUNT(*) AS cnt, COALESCE(MAX(updated_at), '1970-01-01') AS mx FROM \`${table}\``
  )
  return `SELECT SUM(cnt) AS total, MAX(mx) AS newest FROM (${parts.join(' UNION ALL ')}) AS probe`
}

async function probe(domain: ContentDomain): Promise<string> {
  const tables = DOMAIN_TABLES[domain]
  try {
    const rows = (await prisma.$queryRawUnsafe(buildSignatureQuery(tables))) as any[]
    const row = rows?.[0]
    if (!row) return 'v0'

    const newest = row.newest instanceof Date ? row.newest.toISOString() : String(row.newest ?? '')
    return `${String(row.total ?? 0)}:${newest}`
  } catch {
    // A probe failure must never take the page down. Falling back to a fixed
    // value simply means we keep serving the existing cached content.
    return 'v0'
  }
}

export const getContentVersion = cache(
  async (domain: ContentDomain): Promise<string> => probe(domain)
)

/**
 * Wrap a query so its cached result is tied to the freshness of one content
 * domain.
 *
 * The expensive work still goes through `unstable_cache`; the probe above just
 * becomes the first part of the cache key. Nothing changed in the database means
 * the same key and a straight cache hit, so this costs one ~1ms aggregate per
 * request. A save in the admin panel moves the key and the next request rebuilds
 * — no waiting out `revalidate`, and no cache purge to remember.
 *
 * `revalidate` is kept as a backstop: if the probe itself ever fails it returns
 * a constant, and the entry then expires on the timer as it used to.
 */
export function cachedByContent<A extends unknown[], R>(
  domain: ContentDomain,
  keyParts: string[],
  fn: (...args: A) => Promise<R>,
  options: { revalidate?: number; tags?: string[] } = {}
): (...args: A) => Promise<R> {
  const inner = unstable_cache(
    async (_version: string, ...args: unknown[]) => fn(...(args as A)),
    keyParts,
    { revalidate: options.revalidate ?? 86400, tags: options.tags }
  )

  return async (...args: A) => inner(await getContentVersion(domain), ...args) as Promise<R>
}
