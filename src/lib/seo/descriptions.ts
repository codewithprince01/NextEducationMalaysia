/**
 * Meta descriptions built from a page's own data.
 *
 * Course pages were shipping with no `<meta name="description">` at all: the
 * resolver fell back to an empty string when the row had none, and no
 * `course-detail` template row existed to catch it, so Next omitted the tag.
 * Roughly nine in ten course pages had none.
 *
 * A description is not why Google indexes a page — it decides the snippet and
 * the click-through, not the index slot. So this exists to make the pages that
 * do get indexed present well, not as a fix for indexation.
 *
 * Which is also why these are assembled from figures rather than prose. Writing
 * "Study X at Y, one of Malaysia's leading universities" across three thousand
 * pages produces three thousand near-identical sentences and would make the
 * duplication problem worse. Every clause below is dropped unless the page has
 * a real value for it, so a description says only what is true of that course,
 * and a page with nothing to say gets no tag rather than a hollow one.
 */

import { hasAmount, hasText, proseLength } from './indexability'

/** Google truncates the snippet around here; past it the tail is wasted. */
const MAX_LENGTH = 160

/** Collapse markup and entities to a single readable line. */
function toText(value: unknown): string {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Trim to length on a word boundary, and only add an ellipsis when something
 * was actually cut.
 */
function clamp(text: string, max = MAX_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`
}

/** Title-case a shouty enum like `UNDER-GRADUATE` without mangling real text. */
function humanizeLevel(value: unknown): string {
  const text = toText(value)
  if (!text) return ''
  if (text !== text.toUpperCase()) return text
  return text
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`)
}

/** The first sentence of an author's own write-up, when there is one. */
function leadSentence(html: unknown): string {
  const text = toText(html)
  if (text.length < 80) return ''

  const stop = text.search(/[.!?]\s/)
  const sentence = stop > 40 ? text.slice(0, stop + 1) : text
  return clamp(sentence)
}

/**
 * Fee, formatted as a figure a reader recognises. The column is a mix of
 * strings and numbers, and the currency is frequently absent — in which case
 * the amount is still worth showing, just without a symbol it might get wrong.
 */
function formatFee(course: any): string {
  const candidates = [
    course?.total_tuition_fee,
    course?.annual_tuition_fee,
    course?.tution_fee,
    course?.total_fee,
    course?.tutions_fee,
  ]

  const raw = candidates.find((value) => hasAmount(value))
  if (raw == null) return ''

  const amount = Number(String(raw).replace(/[^\d.]/g, ''))
  const currency = toText(course?.currency) || 'RM'
  return `${currency} ${amount.toLocaleString('en-MY')}`
}

/**
 * A course page's description.
 *
 * Prefers the author's own opening line, since a human sentence beats an
 * assembled one. Falls back to the facts that make this course distinct.
 * Returns an empty string when the page has neither, so the caller omits the
 * tag rather than emitting boilerplate.
 */
export function buildCourseDescription(
  course: any,
  universityName?: string | null,
  // The Overview tab, where a course's actual write-up lives.
  contentHtml: Array<unknown> = [],
): string {
  const name = toText(course?.course_name)
  const university = toText(universityName || course?.university?.name)
  if (!name) return ''

  const longestSection = contentHtml
    .map((html) => ({ html, length: proseLength(html) }))
    .sort((a, b) => b.length - a.length)[0]
  const lead =
    leadSentence(course?.overview) ||
    leadSentence(course?.page_content) ||
    leadSentence(longestSection?.html)
  if (lead) return lead

  const opening = university ? `${name} at ${university}.` : `${name}.`

  const facts: string[] = []
  const level = humanizeLevel(course?.level)
  const duration = toText(course?.duration)
  const intake = toText(course?.intake)
  const fee = formatFee(course)
  const mode = toText(course?.study_mode)

  if (level) facts.push(level)
  if (duration) facts.push(`Duration ${duration}`)
  if (fee) facts.push(`Tuition ${fee}`)
  if (intake) facts.push(`Intake ${intake}`)
  if (!fee && mode) facts.push(mode)
  if (hasText(course?.entry_requirement)) facts.push('entry requirements')

  // Nothing course-specific to say. An empty return means no tag at all, which
  // is better than a sentence every other page also carries.
  if (facts.length < 2) return ''

  return clamp(`${opening} ${facts.join('. ')}.`)
}

/**
 * A specialization page's description — same reasoning, different fields. The
 * prose lives in child sections, so the caller passes what it has.
 */
export function buildSpecializationDescription(
  spec: any,
  sectionHtml: Array<unknown> = [],
): string {
  const name = toText(spec?.name)
  if (!name) return ''

  const longest = sectionHtml
    .map((html) => ({ html, length: proseLength(html) }))
    .sort((a, b) => b.length - a.length)[0]

  const lead = leadSentence(longest?.html) || leadSentence(spec?.page_content)
  if (lead) return lead

  const facts: string[] = []
  if (hasText(spec?.duration)) facts.push(`Duration ${toText(spec.duration)}`)
  if (hasText(spec?.avrg_fees)) facts.push(`Average fees ${toText(spec.avrg_fees)}`)
  if (hasText(spec?.avrg_salary)) facts.push(`Average salary ${toText(spec.avrg_salary)}`)
  if (hasText(spec?.job_demand)) facts.push(`Job demand ${toText(spec.job_demand)}`)

  if (facts.length < 2) return ''

  return clamp(`${name} in Malaysia. ${facts.join('. ')}.`)
}
