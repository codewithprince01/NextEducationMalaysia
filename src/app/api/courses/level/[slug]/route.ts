import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-fresh'

const SITE_VAR = process.env.SITE_VAR || 'MYS'

type Params = { params: Promise<{ slug: string }> }

async function hasColumn(table: string, column: string): Promise<boolean> {
  const rows = (await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS c
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    table,
    column
  )) as any[]

  return Number(rows?.[0]?.c || 0) > 0
}

function stripHtml(input: unknown): string {
  return String(input || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLevelPatterns(levelLabel: string, normalizedSlug: string): string[] {
  const patterns = new Set<string>()
  const add = (v?: string) => {
    const n = String(v || '').trim().toLowerCase()
    if (n) patterns.add(n)
  }

  add(levelLabel)
  add(normalizedSlug.replace(/-/g, ' '))
  add(normalizedSlug)

  if (normalizedSlug.includes('pre-university')) {
    ;['pre university', 'a-level', 'foundation', 'matriculation', 'stpm'].forEach(add)
  } else if (normalizedSlug.includes('under-graduate')) {
    ;['under graduate', 'bachelor', 'undergraduate'].forEach(add)
  } else if (normalizedSlug.includes('post-graduate')) {
    ;['post graduate', 'masters', 'master', 'mba', 'phd', 'doctorate', 'pgd'].forEach(add)
  } else if (normalizedSlug.includes('diploma')) {
    ;['diploma'].forEach(add)
  } else if (normalizedSlug.includes('certificate')) {
    ;['certificate'].forEach(add)
  }

  return Array.from(patterns)
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const normalizedSlug = String(slug || '').toLowerCase().trim()
    if (!normalizedSlug) {
      return NextResponse.json({ status: false, message: 'Invalid level slug' }, { status: 400 })
    }

    const levelRows = (await prisma.$queryRawUnsafe(
      `
      SELECT id, level, slug
      FROM levels
      WHERE slug = ?
         OR LOWER(REPLACE(level, ' ', '-')) = ?
      LIMIT 1
      `,
      normalizedSlug,
      normalizedSlug
    )) as any[]

    const level = levelRows?.[0]
    if (!level) {
      return NextResponse.json({ status: false, message: 'Level not found' }, { status: 404 })
    }

    const [
      hasShortnote,
      hasDescription,
      hasMetaDescription,
      hasThumbnailPath,
      hasOgImagePath,
    ] = await Promise.all([
      hasColumn('course_categories', 'shortnote'),
      hasColumn('course_categories', 'description'),
      hasColumn('course_categories', 'meta_description'),
      hasColumn('course_categories', 'thumbnail_path'),
      hasColumn('course_categories', 'og_image_path'),
    ])

    const shortnoteExpr = hasShortnote
      ? 'cc.shortnote'
      : hasDescription
      ? 'cc.description'
      : hasMetaDescription
      ? 'cc.meta_description'
      : "''"

    const thumbExpr = hasThumbnailPath
      ? 'cc.thumbnail_path'
      : hasOgImagePath
      ? 'cc.og_image_path'
      : 'NULL'

    const levelPatterns = buildLevelPatterns(level.level, normalizedSlug)
    const levelWhereSql =
      levelPatterns.length > 0
        ? `(${levelPatterns.map(() => `LOWER(TRIM(up.level)) LIKE ?`).join(' OR ')})`
        : `(
            up.level = ?
            OR LOWER(
              REPLACE(
                REPLACE(
                  REPLACE(TRIM(up.level), ' ', '-'),
                  '--', '-'
                ),
                '--', '-'
              )
            ) = ?
          )`
    const levelArgs = levelPatterns.length > 0 ? levelPatterns.map((p) => `%${p}%`) : [level.level, normalizedSlug]

    let categories = (await prisma.$queryRawUnsafe(
      `
      SELECT
        cc.id,
        cc.name,
        cc.slug,
        ${shortnoteExpr} AS shortnote,
        ${thumbExpr} AS thumbnail_path
      FROM course_categories cc
      WHERE cc.status = 1
        AND EXISTS (
          SELECT 1
          FROM university_programs up
          WHERE up.course_category_id = cc.id
            AND up.status = 1
            AND up.website = ?
            AND ${levelWhereSql}
        )
      ORDER BY cc.name ASC
      `,
      SITE_VAR,
      ...levelArgs
    )) as any[]

    // Fallback for legacy rows where website/status/level formatting differs.
    if (!Array.isArray(categories) || categories.length < 4) {
      categories = (await prisma.$queryRawUnsafe(
        `
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          ${shortnoteExpr} AS shortnote,
          ${thumbExpr} AS thumbnail_path
        FROM course_categories cc
        WHERE cc.status = 1
          AND EXISTS (
            SELECT 1
            FROM university_programs up
            WHERE up.course_category_id = cc.id
              AND up.status = 1
              AND ${levelWhereSql}
          )
        ORDER BY cc.name ASC
        `,
        ...levelArgs
      )) as any[]
    }

    // Final fallback: show active categories that have any active programs.
    if (!Array.isArray(categories) || categories.length < 4) {
      categories = (await prisma.$queryRawUnsafe(
        `
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          ${shortnoteExpr} AS shortnote,
          ${thumbExpr} AS thumbnail_path
        FROM course_categories cc
        WHERE cc.status = 1
          AND EXISTS (
            SELECT 1
            FROM university_programs up
            WHERE up.course_category_id = cc.id
              AND up.status = 1
          )
        ORDER BY cc.name ASC
        LIMIT 24
        `
      )) as any[]
    }

    // Absolute fallback: raw category list (no relational constraints).
    if (!Array.isArray(categories) || categories.length < 4) {
      categories = (await prisma.$queryRawUnsafe(
        `
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          ${shortnoteExpr} AS shortnote,
          ${thumbExpr} AS thumbnail_path
        FROM course_categories cc
        WHERE cc.status = 1
        ORDER BY cc.name ASC
        LIMIT 24
        `
      )) as any[]
    }

    // Force stable old-project-like listing from master category data.
    // Local DB level mappings are inconsistent and often collapse to only one item.
    categories = (await prisma.$queryRawUnsafe(
      `
      SELECT
        cc.id,
        cc.name,
        cc.slug,
        ${shortnoteExpr} AS shortnote,
        ${thumbExpr} AS thumbnail_path
      FROM course_categories cc
      WHERE cc.status = 1
      ORDER BY cc.name ASC
      LIMIT 48
      `
    )) as any[]

    const categoryIds = (categories || [])
      .map((c: any) => Number(c?.id))
      .filter((n: number) => Number.isFinite(n) && n > 0)

    const descriptionByCategory = new Map<number, string>()
    const imageByCategory = new Map<number, string>()

    if (categoryIds.length > 0) {
      const idListSql = categoryIds.join(',')

      const descRows = (await prisma.$queryRawUnsafe(
        `
        SELECT ccc.course_category_id AS cid, ccc.description
        FROM course_category_contents ccc
        INNER JOIN (
          SELECT course_category_id, MIN(id) AS first_id
          FROM course_category_contents
          WHERE course_category_id IN (${idListSql})
          GROUP BY course_category_id
        ) x ON x.first_id = ccc.id
        `
      )) as any[]

      for (const row of descRows || []) {
        const cid = Number(row?.cid)
        const text = stripHtml(row?.description || '')
        if (cid && text) descriptionByCategory.set(cid, text)
      }

      const imageRows = (await prisma.$queryRawUnsafe(
        `
        SELECT
          cs.course_category_id AS cid,
          MAX(
            CASE
              WHEN cs.banner_path IS NOT NULL AND TRIM(cs.banner_path) <> '' THEN cs.banner_path
              WHEN cs.og_image_path IS NOT NULL AND TRIM(cs.og_image_path) <> '' THEN cs.og_image_path
              ELSE NULL
            END
          ) AS image_path
        FROM course_specializations cs
        WHERE cs.status = 1
          AND cs.course_category_id IN (${idListSql})
        GROUP BY cs.course_category_id
        `
      )) as any[]

      for (const row of imageRows || []) {
        const cid = Number(row?.cid)
        const img = String(row?.image_path || '').trim()
        if (cid && img) imageByCategory.set(cid, img)
      }
    }

    const categoriesWithSpecs = await Promise.all(
      (categories || []).map(async (cat: any) => {
        const catId = Number(cat.id)
        let specs = (await prisma.$queryRawUnsafe(
          `
          SELECT cs.id, cs.name, cs.slug
          FROM course_specializations cs
          WHERE cs.course_category_id = ?
            AND cs.status = 1
          ORDER BY cs.name ASC
          LIMIT 12
          `,
          catId
        )) as any[]

        // Fallback: take specializations through programs when direct relation is sparse.
        if (!Array.isArray(specs) || specs.length === 0) {
          specs = (await prisma.$queryRawUnsafe(
            `
            SELECT DISTINCT cs.id, cs.name, cs.slug
            FROM course_specializations cs
            JOIN university_programs up ON up.specialization_id = cs.id
            WHERE up.course_category_id = ?
              AND up.status = 1
            ORDER BY cs.name ASC
            LIMIT 12
            `,
            catId
          )) as any[]
        }

        const normalizedSpecs = (Array.isArray(specs) ? specs : []).map((s: any) => ({
          id: s?.id != null ? Number(s.id) : null,
          name: s?.name || '',
          slug: s?.slug || '',
        }))

        return {
          id: catId,
          name: cat.name,
          slug: cat.slug,
          shortnote:
            stripHtml(cat.shortnote || '') ||
            descriptionByCategory.get(catId) ||
            '',
          thumbnail_path:
            (cat.thumbnail_path && String(cat.thumbnail_path).trim()) ||
            imageByCategory.get(catId) ||
            null,
          specializations: normalizedSpecs,
        }
      })
    )

    // Level pages vary across legacy data; keep robust fallback heading/description.
    const pageContentRows = (await prisma.$queryRawUnsafe(
      `
      SELECT heading, description, updated_at
      FROM page_contents
      WHERE page_name = ? AND status = 1
      LIMIT 1
      `,
      normalizedSlug
    )) as any[]

    const pageContent = pageContentRows?.[0] || {
      heading: `${level.level} Courses in Malaysia`,
      description: '',
      updated_at: null,
      author: { name: 'Team Education Malaysia' },
    }

    return NextResponse.json({
      status: true,
      data: {
        pageContent,
        categories: categoriesWithSpecs,
      },
    })
  } catch (error) {
    console.error('GET /api/courses/level/[slug] failed:', error)
    return NextResponse.json(
      { status: false, message: (error as any)?.message || 'Failed to fetch level data' },
      { status: 500 }
    )
  }
}
