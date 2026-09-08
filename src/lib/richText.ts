/**
 * Shared normaliser for CMS / WYSIWYG-editor HTML.
 *
 * The admin panel stores raw editor output (CKEditor-style): <h2>, <h3>, <p>,
 * <strong>, <em>, <u>, <a>, <ul>/<ol>, <br />, &nbsp;, tables, etc.
 *
 * This function intentionally PRESERVES all of that formatting — it only:
 *   1. strips unsafe markup (scripts, inline event handlers, javascript: URLs),
 *   2. turns blank lines the author typed in the source view into real spacers,
 *   3. wraps <table> in a horizontally scrollable container for mobile.
 *
 * Blank paragraphs are deliberately KEPT. An editor writes deliberate vertical
 * spacing as <p>&nbsp;</p> / <p><br></p>, so dropping them silently deletes
 * spacing the author added on purpose. `.cms-content` gives them a line box so
 * the page matches what the editor showed.
 *
 * All visual styling lives in the `.cms-content` block in globals.css, so the
 * output must be rendered inside an element carrying that class.
 */
export function formatRichText(html?: string | null): string {
  if (!html) return ''

  let out = String(html)

  // --- safety -------------------------------------------------------------
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/<script\b[^>]*\/?>/gi, '')
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  out = out.replace(/((?:href|src)\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2')

  // --- blank lines typed in the editor ------------------------------------
  // Whitespace between two tags collapses to nothing in HTML, so pressing Enter
  // a few times in the source view produced no visible gap on the page even
  // though the newlines were stored faithfully.
  //
  // The mapping is deliberately one-to-one: every blank line between two blocks
  // becomes exactly one spacer, and none is invented. Nothing in `.cms-content`
  // adds vertical margin on its own, so the page shows precisely the spacing the
  // editor shows — and deleting the blank lines in the editor removes the gap
  // here too.
  //
  // Restricted to the boundary between two block-level tags: a stray newline
  // inside a sentence or between inline tags is ordinary word wrapping and must
  // keep collapsing the way it does today.
  const BLOCK = 'p|h[1-6]|ul|ol|div|table|blockquote|figure|section|pre'
  out = out.replace(
    new RegExp(`(</(?:${BLOCK})>)([^\\S\\n]*(?:\\n[^\\S\\n]*)+)(<(?:${BLOCK})\\b)`, 'gi'),
    (_match, close: string, gap: string, open: string) => {
      // n line breaks between two blocks render as n-1 blank lines in the
      // editor, so that is exactly how many spacers the page gets.
      const blankLines = Math.min((gap.match(/\n/g) || []).length - 1, 30)
      if (blankLines <= 0) return `${close}\n${open}`
      const spacer = '<div class="cms-blank-line" aria-hidden="true"></div>\n'
      return `${close}\n${spacer.repeat(blankLines)}${open}`
    }
  )

  // --- tables -------------------------------------------------------------
  // Skip if the content was already wrapped (e.g. by the editor or a re-run).
  if (!/responsive-table-wrapper/i.test(out)) {
    out = out
      .replace(/<table\b/gi, '<div class="responsive-table-wrapper"><table')
      .replace(/<\/table\s*>/gi, '</table></div>')
  }

  return out.trim()
}

export default formatRichText
