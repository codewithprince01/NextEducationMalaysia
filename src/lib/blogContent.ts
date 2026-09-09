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

export function dedupeBlogContent<T = any>(blog: T): T {
  const source = blog as any
  if (!source || typeof source !== 'object') return blog

  const sections: any[] = Array.isArray(source.parent_contents) ? source.parent_contents : []
  if (!sections.length) return blog

  let mainText = toPlainText(source.description)
  let description = source.description

  // The main description merely repeats what a section already says: keep the
  // section, which is the richer copy, and drop the description.
  const mainIsRedundant =
    mainText.length >= MIN_DUPLICATE_TEXT &&
    sections.some((section) => toPlainText(section?.description).includes(mainText))

  if (mainIsRedundant) {
    description = ''
    mainText = ''
  }

  // A section repeats part of the main description: drop the section's body, and
  // the section itself once nothing of its own is left — that keeps the table of
  // contents in step with what actually renders.
  const isDuplicate = (html?: string | null) => {
    if (!mainText) return false
    const text = toPlainText(html)
    return text.length >= MIN_DUPLICATE_TEXT && mainText.includes(text)
  }

  const deduped = sections
    .map((section) => {
      const children: any[] = Array.isArray(section?.child_contents) ? section.child_contents : []
      return {
        ...section,
        description: isDuplicate(section?.description) ? '' : section?.description,
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
