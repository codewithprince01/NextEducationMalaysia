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

/** Recursively convert BigInt and Prisma Decimal to Number for JSON serialization */
export function serializeBigInt<T>(data: T): T {
  if (data === null || data === undefined) return data
  
  if (typeof data === 'bigint') {
    return Number(data) as any
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeBigInt(item)) as any
  }
  
  if (typeof data === 'object') {
    // Handle Prisma Decimal (Decimal.js structure: { d, e, s })
    // and generic objects with functions
    if ('d' in data && 'e' in data && 's' in data && 'constructor' in data) {
       // @ts-ignore - Decimal has a toNumber method
      if (typeof (data as any).toNumber === 'function') {
        return (data as any).toNumber()
      }
    }

    // Handle Date objects (keep as is, Next.js supports them)
    if (data instanceof Date) return data

    const obj = { ...data } as any
    for (const key in obj) {
      obj[key] = serializeBigInt(obj[key])
    }
    return obj
  }
  
  return data
}
