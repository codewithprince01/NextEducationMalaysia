import { prisma } from '@/lib/db-fresh'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getFeaturedUniversities = unstable_cache(
  () =>
    prisma.university.findMany({
      where: { featured: 1, status: 1 },
      select: {
        id: true,
        name: true,
        uname: true,
        logo_path: true,
        city: true,
        state: true,
        qs_rank: true,
        rating: true,
        instituteType: { select: { type: true } },
      },
      orderBy: { name: 'asc' },
      take: 12,
    }).then(serializeBigInt),
  ['featured-universities'],
  { revalidate: 86400, tags: ['universities'] },
)

export async function getUniversitiesByType(typeSlug: string) {
  return unstable_cache(
    async () => {
      const base = typeSlug.replace(/-in-malaysia$/, '');
      const normalized = base.replace(/-universities$/, '-university').replace(/-institutions$/, '-institution');

      // Use raw SQL to avoid rating/qs_rank type mismatches
      const universities = await prisma.$queryRawUnsafe(`
        SELECT u.id, u.name, u.uname, u.logo_path, u.banner_path, u.city, u.state, u.qs_rank, u.rating,
               u.shortnote, u.established_year, u.click,
               (SELECT COUNT(*) FROM university_programs up WHERE up.university_id = u.id AND up.status = 1) as active_programs_count
        FROM universities u
        JOIN institute_types it ON u.institute_type = it.id
        WHERE u.status = 1 AND (
          it.slug = ? OR it.seo_title_slug = ? OR
          it.slug = ? OR it.seo_title_slug = ? OR
          it.slug = ? OR it.slug = ?
        )
        ORDER BY u.name ASC
      `, 
      base, base, 
      normalized, normalized, 
      normalized.replace(/-institution$/, ''), 
      normalized.replace(/-university$/, '')
      );

      return serializeBigInt(universities);
    },
    ['universities-by-type', typeSlug],
    { revalidate: 86400, tags: ['universities'] }
  )();
}

export const getUniversityBySearch = (query: string) =>
  prisma.university.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { uname: { contains: query } },
      ],
      status: 1,
    },
    select: {
      id: true,
      name: true,
      uname: true,
      logo_path: true,
    },
    take: 10,
  })

export const getUniversityPrograms = (universityId: number) => {
  // Use raw SQL for programs to avoid tution_fee type mismatch
  return prisma.$queryRawUnsafe(`
    SELECT up.*, cc.name as category_name, cc.slug as category_slug
    FROM university_programs up
    LEFT JOIN course_categories cc ON up.course_category_id = cc.id
    WHERE up.university_id = ? AND up.status = 1
  `, universityId).then(serializeBigInt);
}

export const getAllUniversities = unstable_cache(
  () =>
    prisma.university.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        uname: true,
        logo_path: true,
        city: true,
        state: true,
        qs_rank: true,
        instituteType: { select: { type: true } },
      } as any,
      orderBy: { name: 'asc' },
    }).then(serializeBigInt),
  ['all-universities'],
  { revalidate: 86400, tags: ['universities'] },
)

export const getInstituteTypes = unstable_cache(
  () =>
    prisma.instituteType.findMany({
      select: { id: true, type: true, slug: true, seo_title_slug: true },
    }).then(serializeBigInt),
  ['institute-types'],
  { revalidate: 86400, tags: ['institute-types'] },
)

export const getPageContent = unstable_cache(
  async (pageName: string) => {
    const results = await prisma.$queryRawUnsafe(`
      SELECT heading, description FROM page_contents 
      WHERE page_name = ? AND status = 1 
      LIMIT 1
    `, pageName) as any[]
    return results[0] || null
  },
  ['page-content'],
  { revalidate: 86400, tags: ['page-contents'] },
)

export const getAllUniversitySlugs = unstable_cache(
  async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ uname: string | null }>>(
      `
      SELECT uname
      FROM universities
      WHERE status = 1
        AND uname IS NOT NULL
        AND uname <> ''
      ORDER BY id ASC
      `
    )

    return rows.map((row) => row.uname).filter(Boolean) as string[]
  },
  ['all-university-slugs'],
  { revalidate: 86400, tags: ['universities'] },
)

export const getUniversityBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number
      name: string | null
      uname: string | null
      city: string | null
      shortnote: string | null
      meta_title: string | null
      meta_description: string | null
      meta_keyword: string | null
      og_image_path: string | null
    }>>(
      `
      SELECT id, name, uname, city, shortnote, meta_title, meta_description, meta_keyword, og_image_path
      FROM universities
      WHERE uname = ?
        AND status = 1
      LIMIT 1
      `,
      slug,
    )

    return rows[0] ? serializeBigInt(rows[0]) : null
  },
  ['university-by-slug-meta'],
  { revalidate: 86400, tags: ['universities', 'seo'] },
)

export const getUniversityFull = unstable_cache(
  async (slug: string) => {
    // 1. Fetch main university data via raw SQL to handle 0000-00-00 dates and type mismatches
    const universities: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM universities WHERE uname = ? AND status = 1 LIMIT 1
    `, slug)

    if (!universities.length) return null
    const university = universities[0]

    const universityId = Number(university.id)

    // 2. Fetch relations via raw SQL to bypass zero-date validation issues.
    // Avoid selecting created_at/updated_at columns because legacy rows may contain
    // invalid values like 0000-00-00 00:00:00.
    const [photos, programs, instituteType, overviews, scholarshipCount, reviewStats, recentReviews] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT id, university_id, photo_path, is_featured FROM university_photos WHERE university_id = ? ORDER BY is_featured DESC, id ASC`,
        universityId
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(`SELECT course_name FROM university_programs WHERE university_id = ? AND status = 1`, universityId) as Promise<any[]>,
      prisma.$queryRawUnsafe(`SELECT type FROM institute_types WHERE id = ?`, Number(university.institute_type)) as Promise<any[]>,
      (async () => {
        try {
          return await prisma.$queryRawUnsafe(
            `SELECT id, title, description, position FROM university_overviews WHERE university_id = ? ORDER BY position ASC, id ASC`,
            universityId
          ) as any[]
        } catch {
          return await prisma.$queryRawUnsafe(
            `SELECT id, title, description FROM university_overviews WHERE university_id = ? ORDER BY id ASC`,
            universityId
          ) as any[]
        }
      })(),
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as total FROM university_scholarships WHERE u_id = ?`,
        universityId
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) AS review_count, ROUND(AVG(rating), 1) AS average_rating
         FROM reviews
         WHERE university_id = ? AND status = 1`,
        universityId
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT name, description, rating
         FROM reviews
         WHERE university_id = ?
           AND status = 1
           AND description IS NOT NULL
           AND TRIM(description) <> ''
         ORDER BY id DESC
         LIMIT 5`,
        universityId
      ) as Promise<any[]>
    ])

    const typeData = instituteType[0]
    const stats = reviewStats?.[0] || {}
    const parsedReviewCount = Number(stats.review_count || 0)
    const parsedAverageRating = Number(stats.average_rating || 0)

    return serializeBigInt({
      ...university,
      photos,
      programs,
      overviews,
      scholarship_count: Number(scholarshipCount?.[0]?.total || 0),
      active_programs_count: programs.length,
      instituteType: typeData,
      review_count: parsedReviewCount,
      average_rating: parsedAverageRating,
      reviews: (recentReviews || []).map((row: any) => ({
        name: row?.name || '',
        description: row?.description || '',
        rating: Number(row?.rating || 0),
      })),
    })
  },
  ['university-full'],
  { revalidate: 300, tags: ['universities'] }
)
