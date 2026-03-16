/**
 * Utility Functions
 * 
 * Ports of Laravel helper functions used across the application.
 */

/** Convert a string to a URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

/** Convert a slug back to readable text */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Current month abbreviation */
export function currentMonth(): string {
  return new Date().toLocaleString('en', { month: 'short' })
}

/** Current year string */
export function currentYear(): string {
  return new Date().getFullYear().toString()
}

/** Strip HTML tags from a string */
export function stripTags(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

/** Truncate text to a given length */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}
