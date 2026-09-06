import { cache } from 'react'
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
  university: ['universities', 'university_programs', 'university_program_contents'],
  scholarship: ['scholarships'],
  blog: ['blogs', 'blog_categories', 'blog_contents', 'blog_faqs'],
  'page-contents': ['page_contents', 'page_banners'],
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
