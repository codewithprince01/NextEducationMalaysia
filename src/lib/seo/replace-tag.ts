/**
 * SEO Replace Tag Utility
 * 
 * Port of Laravel's replaceTag() helper function.
 * Replaces %placeholder% tokens in SEO template strings
 * with actual values from a tag dictionary.
 */

export function replaceTag(
  template: string | null | undefined,
  tags: Record<string, string | number | null | undefined>
): string {
  if (!template) return ''

  return Object.entries(tags).reduce(
    (str, [key, value]) => str.replaceAll(`%${key}%`, String(value ?? '')),
    template
  )
}
