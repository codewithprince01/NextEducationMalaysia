import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'
import { SITE_VAR } from '@/lib/constants'

function toSeoSlug(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function fetchSpecializationDetail(slug: string) {
  const specRows = await prisma.$queryRawUnsafe(`
    SELECT
      cs.*,
      cc.name AS course_category_name,
      cc.slug AS course_category_slug
    FROM course_specializations cs
    LEFT JOIN course_categories cc ON cc.id = cs.course_category_id
    WHERE cs.slug = ?
      AND cs.website = ?
      AND EXISTS (
        SELECT 1
        FROM specialization_contents sc
        WHERE sc.specialization_id = cs.id
      )
    LIMIT 1
  `, slug, SITE_VAR) as any[]

  const specialization = specRows[0]
  if (!specialization) return null

  const [contents, faqs, levels, relatedUniversities, otherSpecializations, featuredUniversities] = await Promise.all([
    prisma.$queryRawUnsafe(`
      SELECT *
      FROM specialization_contents
      WHERE specialization_id = ?
      ORDER BY COALESCE(position, 0), id
    `, specialization.id) as Promise<any[]>,
    prisma.$queryRawUnsafe(`
      SELECT *
      FROM course_specialization_faqs
      WHERE specialization_id = ?
      ORDER BY id
    `, specialization.id) as Promise<any[]>,
    prisma.$queryRawUnsafe(`
      SELECT *
      FROM specialization_levels
      WHERE specialization_id = ?
      ORDER BY id
    `, specialization.id) as Promise<any[]>,
    prisma.$queryRawUnsafe(`
      SELECT
        u.id,
        u.name,
        u.uname,
        u.logo_path,
        u.banner_path,
        u.city,
        u.inst_type,
        u.qs_rank,
        COUNT(up.id) AS allspcprograms
      FROM universities u
      JOIN university_programs up ON up.university_id = u.id
      WHERE up.specialization_id = ?
        AND up.status = 1
        AND up.website = ?
        AND u.status = 1
        AND u.website = ?
      GROUP BY u.id, u.name, u.uname, u.logo_path, u.banner_path, u.city, u.inst_type, u.qs_rank
      ORDER BY u.name ASC
    `, specialization.id, SITE_VAR, SITE_VAR) as Promise<any[]>,
    prisma.$queryRawUnsafe(`
      SELECT id, name, slug
      FROM course_specializations
      WHERE id <> ?
        AND website = ?
        AND EXISTS (
          SELECT 1
          FROM specialization_contents sc
          WHERE sc.specialization_id = course_specializations.id
        )
      ORDER BY RAND()
      LIMIT 10
    `, specialization.id, SITE_VAR) as Promise<any[]>,
    prisma.$queryRawUnsafe(`
      SELECT id, name, uname, logo_path, banner_path, city
      FROM universities
      WHERE status = 1
        AND featured = 1
        AND website = ?
      ORDER BY updated_at DESC
      LIMIT 10
    `, SITE_VAR) as Promise<any[]>,
  ])

  const normalizedLevels = levels.map((level) => ({
    ...level,
    level_name: level.level_name ?? level.level ?? null,
  }))

  const detail = {
    specialization: {
      ...specialization,
      courseCategory: specialization.course_category_id
        ? {
            name: specialization.course_category_name,
            slug: specialization.course_category_slug,
          }
        : null,
      contents,
      faqs,
      specializationLevels: normalizedLevels,
      specializationlevels: normalizedLevels,
      specialization_levels: normalizedLevels,
    },
    related_universities: relatedUniversities,
    other_specializations: otherSpecializations,
    featured_universities: featuredUniversities,
  }

  return serializeBigInt(detail)
}

export const getAllSpecializationSlugs = unstable_cache(
  async () => {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT slug
      FROM course_specializations
      WHERE website = ?
        AND slug IS NOT NULL
        AND slug <> ''
        AND EXISTS (
          SELECT 1
          FROM specialization_contents sc
          WHERE sc.specialization_id = course_specializations.id
        )
      ORDER BY name ASC
    `, SITE_VAR) as any[]

    return rows.map((row) => row.slug).filter(Boolean) as string[]
  },
  ['specialization-slugs'],
  { revalidate: 86400 },
)

export const getSpecializationBySlug = unstable_cache(
  async (slug: string) => fetchSpecializationDetail(slug),
  ['specialization-detail'],
  { revalidate: 86400, tags: ['specialization'] },
)

export const getSpecializationLevel = unstable_cache(
  async (specSlug: string, levelSlug: string) => {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT
        sl.*,
        cs.name AS specialization_name,
        cs.slug AS specialization_slug
      FROM specialization_levels sl
      JOIN course_specializations cs ON cs.id = sl.specialization_id
      WHERE cs.slug = ?
        AND cs.website = ?
      ORDER BY sl.id
    `, specSlug, SITE_VAR) as any[]

    const level = rows.find((row) => {
      const rawSlug = row.url_slug || row.level_slug || ''
      const composedSlug =
        row.level_slug && row.specialization_name
          ? `${row.level_slug}-in-${toSeoSlug(row.specialization_name)}`
          : row.level_slug || ''

      return rawSlug === levelSlug || composedSlug === levelSlug
    })
    if (!level) return null

    const contents = await prisma.$queryRawUnsafe(`
      SELECT *
      FROM specialization_level_contents
      WHERE specialization_level_id = ?
      ORDER BY COALESCE(position, 0), id
    `, level.id) as any[]

    return serializeBigInt({
      ...level,
      specialization: {
        name: level.specialization_name,
        slug: level.specialization_slug,
      },
      contents,
    })
  },
  ['specialization-level-detail'],
  { revalidate: 86400 },
)

export const getAllSpecializations = unstable_cache(
  async () => {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT
        cs.id,
        cs.name,
        cs.slug,
        cs.banner_path,
        cs.course_category_id,
        cc.name AS course_category_name,
        cc.slug AS course_category_slug,
        (
          SELECT COUNT(*)
          FROM university_programs up
          WHERE up.specialization_id = cs.id
            AND up.status = 1
            AND up.website = ?
        ) AS program_count
      FROM course_specializations cs
      LEFT JOIN course_categories cc ON cc.id = cs.course_category_id
      WHERE cs.website = ?
        AND EXISTS (
          SELECT 1
          FROM specialization_contents sc
          WHERE sc.specialization_id = cs.id
        )
      ORDER BY cs.name ASC
    `, SITE_VAR, SITE_VAR) as any[]

    return serializeBigInt(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        banner_path: row.banner_path,
        courseCategory: row.course_category_id
          ? {
              name: row.course_category_name,
              slug: row.course_category_slug,
            }
          : null,
        _count: {
          programs: Number(row.program_count || 0),
        },
      }))
    )
  },
  ['all-specializations'],
  { revalidate: 86400 },
)
