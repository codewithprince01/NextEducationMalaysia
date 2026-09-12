/**
 * Index-worthiness rules.
 *
 * Google reports most course and specialization pages as "Crawled – currently
 * not indexed". That verdict is a judgement about value, not a robots problem:
 * the site publishes thousands of URLs where the only thing filled in is the
 * course name, its level and its study mode — fields that read almost
 * identically across the whole catalogue. Asking Google to index all of them
 * spends crawl budget on pages it will refuse anyway, and a large body of thin
 * pages is a signal that works against the pages worth having.
 *
 * So each page states its own case. A page that carries something a reader
 * cannot get from any other page — real prose, a tuition fee, entry
 * requirements — asks to be indexed. A page that does not asks to be followed
 * but not indexed, which keeps it crawlable and keeps its links flowing to the
 * university and specialization pages while declining the index slot.
 *
 * The rules live here, in one place, because three separate systems have to
 * agree on the answer: the page metadata, the XML sitemaps, and anything else
 * that later needs to know. A sitemap that advertises a `noindex` page is a
 * contradiction that wastes exactly the crawl budget this is meant to protect.
 *
 * Nothing here is a permanent verdict. The rules read live fields, so the first
 * crawl after somebody fills in a fee or writes an overview finds the page
 * asking to be indexed. Improving the data is the whole mechanism — there is no
 * list to maintain and no deploy needed.
 */

import type { Metadata } from 'next'

/**
 * Prose long enough to be worth reading. Set well below a "good" page — this is
 * the line under which a page has effectively nothing, not the line above which
 * it is strong. Metallurgy's whole body is 43 characters.
 */
const MIN_PROSE_LENGTH = 200

/**
 * How many distinct facts stand in for prose. One fact alone is too weak: an
 * intake month, on its own, is not a reason for a page to exist. Two facts mean
 * the page answers at least a couple of real questions.
 */
const MIN_DISTINCT_FACTS = 2

export type Indexability = {
  index: boolean
  /**
   * Which signals were found. Carried so a page can build a description out of
   * the same facts that justified indexing it, and so the reason is legible
   * when auditing why a URL is in or out.
   */
  signals: string[]
}

const NOT_A_VALUE = new Set(['', '0', 'n/a', 'na', 'null', 'undefined', '-', 'tbd', 'nil'])

/** A text field a human actually filled in, as opposed to left at a placeholder. */
export function hasText(value: unknown): boolean {
  if (value == null) return false
  const text = String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim()
  return text.length > 0 && !NOT_A_VALUE.has(text.toLowerCase())
}

/** A number field with a real figure in it. Fees arrive as strings often enough. */
export function hasAmount(value: unknown): boolean {
  if (value == null) return false
  const amount = Number(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) && amount > 0
}

/** Readable length of an HTML fragment, so markup does not inflate a thin page. */
export function proseLength(html: unknown): number {
  if (html == null) return 0
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

/**
 * Decide from a set of named signals.
 *
 * `prose` is enough on its own — a page with a real write-up earns its place
 * regardless of which structured fields happen to be filled in. Otherwise the
 * page needs several independent facts before it is more than a stub.
 */
function decide(signals: Record<string, boolean>, hasProse: boolean): Indexability {
  const present = Object.entries(signals)
    .filter(([, found]) => found)
    .map(([name]) => name)

  const factCount = present.filter((name) => name !== 'prose').length
  return {
    index: hasProse || factCount >= MIN_DISTINCT_FACTS,
    signals: present,
  }
}

/**
 * A course page.
 *
 * Only fields that actually vary between courses count. Measured over the
 * catalogue, `exam_required` holds 4 distinct values across 570 rows,
 * `scholarship_info` 3 across 497, `mode_of_instruction` 2 across 605 and
 * `accreditations` 3 across 60 — they are filled in from a dropdown and say
 * nothing specific about the course, so they are not signals. Nor are level,
 * study mode, duration or the course name, for the same reason. Counting any
 * of them would let a page qualify on wording it shares with hundreds of
 * others, which is the failure this check exists to catch.
 *
 * What is left genuinely varies: fees (91 distinct figures), entry
 * requirements (233 across 496), intake (304 across 2320) and the application
 * deadline (51 across 742).
 *
 * The fee check spans several columns because the admin panel has accumulated
 * more than one place to record the same figure, and a page is no thinner for
 * having its fee stored in the older one.
 */
export function getCourseIndexability(
  course: any,
  // A course keeps most of its writing in `university_program_contents` rows —
  // the Overview, Entry Requirement and Career Opportunity tabs — not in the
  // `overview` column, which is empty on 83% of rows. Judging a course without
  // these marks the majority of the catalogue thin when it is not: 2,867 of
  // 3,636 courses have a section of 200+ characters, and those bodies are 96%
  // distinct. Callers that hold the rows pass their descriptions here.
  contentHtml: Array<unknown> = [],
): Indexability {
  const longestSection = contentHtml.reduce<number>(
    (max, html) => Math.max(max, proseLength(html)),
    0,
  )
  const hasProse =
    longestSection >= MIN_PROSE_LENGTH ||
    proseLength(course?.overview) >= MIN_PROSE_LENGTH ||
    proseLength(course?.page_content) >= MIN_PROSE_LENGTH

  return decide(
    {
      prose: hasProse,
      fee:
        hasAmount(course?.total_tuition_fee) ||
        hasAmount(course?.annual_tuition_fee) ||
        hasAmount(course?.tution_fee) ||
        hasAmount(course?.total_fee) ||
        hasAmount(course?.tutions_fee),
      entryRequirement: hasText(course?.entry_requirement),
      intake: hasText(course?.intake),
      deadline: hasText(course?.application_deadline),
    },
    hasProse,
  )
}

/**
 * A specialization hub page.
 *
 * Its prose lives in child `specialization_contents` rows rather than a column
 * on the specialization itself, so callers pass the longest section they hold.
 */
export function getSpecializationIndexability(
  spec: any,
  sectionHtml: Array<unknown> = [],
): Indexability {
  const longest = sectionHtml.reduce<number>((max, html) => Math.max(max, proseLength(html)), 0)
  const hasProse = longest >= MIN_PROSE_LENGTH || proseLength(spec?.page_content) >= MIN_PROSE_LENGTH

  return decide(
    {
      prose: hasProse,
      fees: hasText(spec?.avrg_fees),
      salary: hasText(spec?.avrg_salary),
      jobDemand: hasText(spec?.job_demand),
      coursesDescription: hasText(spec?.courses_description),
    },
    hasProse,
  )
}

/**
 * A specialization level page (`/specialization/<slug>/<level>`).
 *
 * These read as duplicates of their parent by URL shape, but they are not: the
 * bodies are written per level and are near-uniformly distinct. Many carry
 * substantially more than the specialization above them, so a level is judged
 * on its own content and never inherits the hub's verdict.
 *
 * Its own prose is the only signal. The structured columns on the level row —
 * duration, intake, tuition_fees, accreditation — are filled on every row but
 * hold just 6, 3, 8 and 1 distinct values respectively across the whole table,
 * with hundreds of rows sharing a value. Counting them as facts would pass
 * every level page ever created and make the check meaningless.
 */
export function getSpecializationLevelIndexability(
  level: any,
  sectionHtml: Array<unknown> = [],
): Indexability {
  void level
  const longest = sectionHtml.reduce<number>((max, html) => Math.max(max, proseLength(html)), 0)
  const hasProse = longest >= MIN_PROSE_LENGTH

  return decide({ prose: hasProse }, hasProse)
}

/**
 * The robots directive for a verdict.
 *
 * `follow` in both branches on purpose. A thin page is still a route to the
 * pages that are worth indexing, and its links should keep carrying weight to
 * them; the only thing being declined is the index slot. `nofollow` would throw
 * that away for no gain.
 */
export function robotsFor({ index }: Indexability): Metadata['robots'] {
  return index
    ? { index: true, follow: true, googleBot: { index: true, follow: true } }
    : { index: false, follow: true, googleBot: { index: false, follow: true } }
}
