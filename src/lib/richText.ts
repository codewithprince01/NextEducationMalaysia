/**
 * Shared normaliser for CMS / WYSIWYG-editor HTML.
 *
 * The admin panel stores raw editor output (CKEditor-style): <h2>, <h3>, <p>,
 * <strong>, <em>, <u>, <a>, <ul>/<ol>, <br />, &nbsp;, tables, etc.
 *
 * This function intentionally PRESERVES all of that formatting — it only:
 *   1. strips unsafe markup (scripts, inline event handlers, javascript: URLs),
 *   2. removes paste artefacts that render as blank space nobody asked for,
 *   3. turns EXTRA blank lines the author typed in the source view into spacers,
 *   4. wraps <table> in a horizontally scrollable container for mobile.
 *
 * Blank paragraphs are deliberately KEPT. An editor writes deliberate vertical
 * spacing as <p>&nbsp;</p> / <p><br></p>, so dropping them silently deletes
 * spacing the author added on purpose. `.cms-content` gives them a line box so
 * the page matches what the editor showed.
 *
 * All visual styling lives in the `.cms-content` block in globals.css, so the
 * output must be rendered inside an element carrying that class.
 */
const ADMIN_ORIGIN = (
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'
).replace(/\/+$/, '')

// Hosts that never serve uploaded files. The editor sometimes writes image URLs
// against the public site instead of the admin host, and those 404.
const PUBLIC_HOSTS = /^https?:\/\/(?:www\.)?educationmalaysia\.in\//i

/**
 * Point a CMS image at the host that actually stores it.
 *
 * Uploads live on the admin domain under `/storage/…`. Editor content carries a
 * mix of shapes — the public host, a bare `/uploads/…` path, sometimes a
 * scrambled `assets/storage/…` prefix — and all of them 404 as written. External
 * images and data: URIs are left completely alone.
 */
function resolveCmsImageSrc(src: string): string {
  const value = src.trim()
  if (!value || /^(?:data:|blob:|#)/i.test(value)) return src

  let path: string | null = null

  if (PUBLIC_HOSTS.test(value)) {
    path = value.replace(/^https?:\/\/[^/]+\//i, '')
  } else if (/^\/(?:uploads|assets|storage)\//i.test(value)) {
    path = value.slice(1)
  } else {
    // Already on the admin host, or a third-party image: leave it as it is.
    return src
  }

  // Fold the scrambled prefixes some rows carry back into the canonical one,
  // then apply exactly one `storage/`.
  path = path
    .replace(/^storage\/assets\/storage\//i, 'assets/')
    .replace(/^assets\/storage\/uploadFiles\//i, 'assets/uploadFiles/')
    .replace(/^storage\/assets\/uploadFiles\//i, 'assets/uploadFiles/')
    .replace(/^storage\//i, '')

  return `${ADMIN_ORIGIN}/storage/${path}`
}

export function formatRichText(html?: string | null): string {
  if (!html) return ''

  let out = String(html)

  // --- safety -------------------------------------------------------------
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/<script\b[^>]*\/?>/gi, '')
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  out = out.replace(/((?:href|src)\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2')

  // --- whole-page markup that leaked into a content fragment ----------------
  // Pasting a complete HTML document into the editor stores its <style>, <meta>
  // and <title> along with the text. The <style> is the damaging one: its rules
  // are unscoped, so `body { margin: 40px }` or `h2 { margin-top: 30px }` from
  // one article restyles every page it appears on — spacing nobody asked for and
  // nobody can find in the editor. A content fragment has no business carrying
  // document-level markup, so it all goes.
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  out = out.replace(/<style\b[^>]*\/?>/gi, '')
  out = out.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
  out = out.replace(/<\/?(?:html|head|body)\b[^>]*>/gi, '')
  out = out.replace(/<(?:meta|link|base)\b[^>]*\/?>/gi, '')

  // --- paste artefacts ------------------------------------------------------
  // Pasting from Word or Google Docs leaves <!--StartFragment--> / <!--EndFragment-->
  // markers, usually alone inside their own paragraph. They show nothing but
  // still occupy a line, so the page gains blank space the author never typed.
  // A paragraph holding only comments is dropped; a paragraph holding &nbsp; is
  // NOT — that one is a blank line the author deliberately added.
  //
  // The surrounding newlines go with it, replaced by the single separator the
  // editor would have written. Leaving them behind would merge the blank line
  // before the paragraph with the one after it, and the blank-line pass below
  // would then read that doubled gap as spacing the author asked for.
  out = out.replace(/\s*<p\b[^>]*>(?:\s|<!--[\s\S]*?-->)*<\/p>\s*/gi, '\n\n')
  out = out.replace(/<!--\s*(?:Start|End)Fragment\s*-->/gi, '')

  // --- blank lines typed in the editor ------------------------------------
  // Whitespace between two tags collapses to nothing in HTML, so extra Enters in
  // the source view produced no visible gap even though the newlines were stored.
  //
  // CKEditor writes ONE blank line between every block on its own — that is how
  // it serialises, not something the author typed, and the WYSIWYG view never
  // shows it. Treating that baseline as spacing would push every page apart, so
  // only the newlines BEYOND it become spacers. Ordinary spacing between blocks
  // comes from the margins in `.cms-content`, exactly as the editor renders it.
  //
  // Restricted to the boundary between two block-level tags: a stray newline
  // inside a sentence or between inline tags is ordinary word wrapping and must
  // keep collapsing the way it does today.
  const BLOCK = 'p|h[1-6]|ul|ol|div|table|blockquote|figure|section|pre'
  out = out.replace(
    new RegExp(`(</(?:${BLOCK})>)([^\\S\\n]*(?:\\n[^\\S\\n]*)+)(<(?:${BLOCK})\\b)`, 'gi'),
    (_match, close: string, gap: string, open: string) => {
      // 2 line breaks == 1 blank line == the editor's own separator == no spacer.
      const extraBlankLines = Math.min((gap.match(/\n/g) || []).length - 2, 30)
      if (extraBlankLines <= 0) return `${close}\n${open}`
      const spacer = '<div class="cms-blank-line" aria-hidden="true"></div>\n'
      return `${close}\n${spacer.repeat(extraBlankLines)}${open}`
    }
  )

  // --- image hosts ----------------------------------------------------------
  out = out.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*")([^"]+)(")/gi,
    (_m, pre: string, src: string, post: string) => `${pre}${resolveCmsImageSrc(src)}${post}`
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
