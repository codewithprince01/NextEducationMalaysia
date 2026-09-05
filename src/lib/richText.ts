/**
 * Shared normaliser for CMS / WYSIWYG-editor HTML.
 *
 * The admin panel stores raw editor output (CKEditor-style): <h2>, <h3>, <p>,
 * <strong>, <em>, <u>, <a>, <ul>/<ol>, <br />, &nbsp;, tables, etc.
 *
 * This function intentionally PRESERVES all of that formatting — it only:
 *   1. strips unsafe markup (scripts, inline event handlers, javascript: URLs),
 *   2. wraps <table> in a horizontally scrollable container for mobile.
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
