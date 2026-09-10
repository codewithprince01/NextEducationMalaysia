/**
 * Blog article de-duplication.
 *
 * Some articles are stored twice by the admin panel: the whole piece in
 * `blogs.description`, and the same piece again split across `blog_contents`
 * rows — or, less often, a short intro in `description` that also opens the
 * first section. The detail page renders the main description and the sections
 * in separate places, so those articles printed everything twice.
 *
 * Whichever copy is wholly contained in the other is dropped, comparing the
 * readable text rather than the markup so differences in tags, entities or
 * whitespace cannot hide the duplication. Sections that carry their own
 * material are left alone.
 *
 * Applied on the server before the payload is handed to the client component,
 * so the duplicate never reaches the browser at all, and again inside the
 * component for the paths that fetch their own data.
 */

/** The readable text of a fragment, with markup and entity noise removed. */
export function toPlainText(html?: string | null): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

// Short fragments are ignored: one shared sentence is not evidence that a whole
// section duplicates the article.
const MIN_DUPLICATE_TEXT = 120

/** Epoch milliseconds, or 0 when there is no usable timestamp. */
function timestampOf(value: unknown): number {
  if (!value) return 0
  const time = new Date(value as string | number | Date).getTime()
  return Number.isFinite(time) ? time : 0
}

export function dedupeBlogContent<T = any>(blog: T): T {
  const source = blog as any
  if (!source || typeof source !== 'object') return blog

  const sections: any[] = Array.isArray(source.parent_contents) ? source.parent_contents : []
  if (!sections.length) return blog

  const mainText = toPlainText(source.description)
  let description = source.description

  // Copies of one article: the main description plus any section that contains
  // it or is contained by it. Only one of them may render.
  const sameCopySections =
    mainText.length >= MIN_DUPLICATE_TEXT
      ? sections.filter((section) => {
          const text = toPlainText(section?.description)
          if (text.length < MIN_DUPLICATE_TEXT) return false
          return text.includes(mainText) || mainText.includes(text)
        })
      : []

  const dropped = new Set<any>()

  if (sameCopySections.length) {
    // Which copy survives is decided by `updated_at`, so a save in the admin
    // panel always wins over the stale twin. This matters because editing only
    // a link's href leaves the plain text identical — without the timestamp the
    // edited copy looks like the same duplicate as before and gets discarded
    // every time, so the change never reaches the page.
    //
    // A section is dropped only when both timestamps are known and prove it
    // clearly older. When they are missing the section wins, exactly as before.
    //
    // The margin exists because saving a section can also touch the parent blog
    // row. Without it that touch would make the main body look newer by a
    // second and quietly resurrect the copy the editor had just replaced — the
    // exact failure this whole branch is here to prevent. Anything inside the
    // margin counts as the same save, and the section (the copy the admin panel
    // actually edits) wins.
    const SAME_SAVE_MARGIN_MS = 2 * 60 * 1000
    const mainTime = timestampOf(source.updated_at)
    const survivors: any[] = []

    for (const section of sameCopySections) {
      const sectionTime = timestampOf(section?.updated_at)
      const provenOlder =
        mainTime > 0 && sectionTime > 0 && sectionTime < mainTime - SAME_SAVE_MARGIN_MS
      if (provenOlder) dropped.add(section)
      else survivors.push(section)
    }

    // The main description steps aside only if a duplicate is left to replace it.
    if (survivors.length) description = ''
  }

  // A section repeats part of whichever main description survived: drop the
  // section's body, and the section itself once nothing of its own is left —
  // that keeps the table of contents in step with what actually renders.
  const survivingMainText = toPlainText(description)
  const isDuplicate = (html?: string | null) => {
    if (!survivingMainText) return false
    const text = toPlainText(html)
    return text.length >= MIN_DUPLICATE_TEXT && survivingMainText.includes(text)
  }

  const deduped = sections
    .map((section) => {
      const children: any[] = Array.isArray(section?.child_contents) ? section.child_contents : []
      const isStaleCopy = dropped.has(section)
      return {
        ...section,
        description: isStaleCopy || isDuplicate(section?.description) ? '' : section?.description,
        child_contents: children.filter((child) => !isDuplicate(child?.description)),
      }
    })
    .filter((section) => toPlainText(section.description) || section.child_contents.length > 0)

  return { ...source, description, parent_contents: deduped }
}

/**
 * Same treatment applied to a whole service payload, whatever shape it arrives
 * in — the blog sits under `data.blog`, `blog`, or at the root.
 */
export function dedupeBlogPayload(payload: any): any {
  if (!payload || typeof payload !== 'object') return payload

  if (payload.data && typeof payload.data === 'object') {
    return { ...payload, data: dedupeBlogPayload(payload.data) }
  }
  if (payload.blog && typeof payload.blog === 'object') {
    return { ...payload, blog: dedupeBlogContent(payload.blog) }
  }
  if (Array.isArray(payload.parent_contents)) {
    return dedupeBlogContent(payload)
  }
  return payload
}
