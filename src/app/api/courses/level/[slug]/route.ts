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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const normalizedSlug = String(slug || '').toLowerCase().trim()
    const compactSlug = normalizedSlug.replace(/[^a-z0-9]/g, '')
    if (!normalizedSlug) {
      return NextResponse.json({ status: false, message: 'Invalid level slug' }, { status: 400 })
    }

    const hasLevelCoursesDescription = await hasColumn('levels', 'courses_description')
    const levelRows = (await prisma.$queryRawUnsafe(
      `
      SELECT id, level, slug ${hasLevelCoursesDescription ? ', courses_description' : ''}
      FROM levels
      WHERE slug = ?
         OR LOWER(REPLACE(level, ' ', '-')) = ?
         OR LOWER(REPLACE(REPLACE(REPLACE(slug, '-', ''), '.', ''), ' ', '')) = ?
         OR LOWER(REPLACE(REPLACE(REPLACE(level, '-', ''), '.', ''), ' ', '')) = ?
      LIMIT 1
      `,
      normalizedSlug,
      normalizedSlug,
      compactSlug,
      compactSlug
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

    const normalizeLevelKey = (value: unknown) =>
      String(value || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')

    const levelCandidates = new Set<string>()
    levelCandidates.add(String(level.level || '').trim())
    levelCandidates.add(String(level.slug || '').trim())
    levelCandidates.add(normalizedSlug)

    // Old-project compatibility: /courses/phd should match PHD/Ph.D variants in programs
    if (compactSlug === 'phd' || compactSlug === 'doctorate' || normalizeLevelKey(level.level) === 'PHD') {
      levelCandidates.add('PHD')
      levelCandidates.add('Ph.D')
      levelCandidates.add('Phd')
      levelCandidates.add('Doctorate')
    }

    const normalizedLevelCandidates = [...levelCandidates]
      .map((v) => normalizeLevelKey(v))
      .filter(Boolean)

    const levelNormExpr =
      "REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(up.level)), '.', ''), '-', ''), ' ', ''), '/', '')"
    const levelWhereSql =
      normalizedLevelCandidates.length > 0
        ? `${levelNormExpr} IN (${normalizedLevelCandidates.map(() => '?').join(', ')})`
        : '1 = 0'
    // Old-project equivalent: strict level + active university + website
    let categories = (await prisma.$queryRawUnsafe(
      `
      SELECT
        cc.id,
        cc.name,
        cc.slug,
        ${shortnoteExpr} AS shortnote,
        ${thumbExpr} AS thumbnail_path
      FROM course_categories cc
      WHERE EXISTS (
          SELECT 1
          FROM university_programs up
          JOIN universities u ON u.id = up.university_id
          WHERE up.course_category_id = cc.id
            AND up.status = 1
            AND up.website = ?
            AND u.status = 1
            AND ${levelWhereSql}
        )
      ORDER BY cc.name ASC
      `,
      SITE_VAR,
      ...normalizedLevelCandidates
    )) as any[]

    // Safety fallback only when strict website-scoped result is empty.
    if (!Array.isArray(categories) || categories.length === 0) {
      categories = (await prisma.$queryRawUnsafe(
        `
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          ${shortnoteExpr} AS shortnote,
          ${thumbExpr} AS thumbnail_path
        FROM course_categories cc
        WHERE EXISTS (
            SELECT 1
            FROM university_programs up
            JOIN universities u ON u.id = up.university_id
            WHERE up.course_category_id = cc.id
              AND up.status = 1
              AND u.status = 1
              AND ${levelWhereSql}
          )
        ORDER BY cc.name ASC
        `,
        ...normalizedLevelCandidates
      )) as any[]
    }

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
          SELECT DISTINCT cs.id, cs.name, cs.slug
          FROM course_specializations cs
          JOIN university_programs up ON up.specialization_id = cs.id
          JOIN universities u ON u.id = up.university_id
          WHERE cs.course_category_id = ?
            AND up.status = 1
            AND u.status = 1
            AND ${levelWhereSql}
            AND up.website = ?
          ORDER BY cs.name ASC
          `,
          catId,
          ...normalizedLevelCandidates,
          SITE_VAR
        )) as any[]

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
    let pageContentRows = (await prisma.$queryRawUnsafe(
      `
      SELECT heading, description, updated_at
      FROM page_contents
      WHERE page_name = ? AND website = ? AND status = 1
      LIMIT 1
      `,
      normalizedSlug,
      SITE_VAR
    )) as any[]

    if (!pageContentRows?.length) {
      pageContentRows = (await prisma.$queryRawUnsafe(
        `
        SELECT heading, description, updated_at
        FROM page_contents
        WHERE page_name = ? AND status = 1
        LIMIT 1
        `,
        normalizedSlug
      )) as any[]
    }

    const levelLabel =
      compactSlug === 'phd'
        ? 'PhD'
        : String(level.level || normalizedSlug)
            .toLowerCase()
            .replace(/\b\w/g, (m) => m.toUpperCase())
    const fallbackHeading = `${levelLabel} Courses in Malaysia`
    const fallbackDescription = hasLevelCoursesDescription
      ? String((level as any).courses_description || '').trim()
      : ''

    const pageContent = {
      heading: String(pageContentRows?.[0]?.heading || '').trim() || fallbackHeading,
      description: String(pageContentRows?.[0]?.description || '').trim() || fallbackDescription,
      updated_at: pageContentRows?.[0]?.updated_at || null,
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
