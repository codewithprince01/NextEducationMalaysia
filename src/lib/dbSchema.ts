import { prisma } from '@/lib/db'

/**
 * Optional-column tolerance for raw SQL.
 *
 * A few columns exist in the production database but not in every dump a
 * developer has locally (`universities.scholarship_available` is the current
 * one). A raw query naming a missing column fails with MySQL error 1054 and
 * takes the whole page down with a 500 — even though the value is optional and
 * the query already has another way to derive it.
 *
 * `hasColumn` lets a query ask first and pick a safe expression instead. The
 * answer is cached per process: the schema cannot change under a running
 * server, so this costs one tiny query per column per boot.
 */
const cache = new Map<string, Promise<boolean>>()

// Identifiers are interpolated into the SQL, so keep them to a safe shape.
const SAFE_IDENTIFIER = /^[A-Za-z0-9_]+$/

export function hasColumn(table: string, column: string): Promise<boolean> {
  const key = `${table}.${column}`
  const cached = cache.get(key)
  if (cached) return cached

  const lookup = (async () => {
    if (!SAFE_IDENTIFIER.test(table) || !SAFE_IDENTIFIER.test(column)) return false
    try {
      const rows = (await prisma.$queryRawUnsafe(
        `SHOW COLUMNS FROM \`${table}\` LIKE ?`,
        column
      )) as unknown[]
      return Array.isArray(rows) && rows.length > 0
    } catch {
      // Treating an unreadable schema as "column absent" keeps the caller on
      // its fallback expression rather than crashing the request.
      return false
    }
  })()

  cache.set(key, lookup)
  return lookup
}

/**
 * `expression` when the column exists, `fallback` when it does not.
 * Both sides are written by us, never by user input.
 */
export async function columnOr(
  table: string,
  column: string,
  expression: string,
  fallback: string
): Promise<string> {
  return (await hasColumn(table, column)) ? expression : fallback
}
