import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getHomePageData = unstable_cache(
  async () => {
    const website = process.env.SITE_VAR || 'MYS'
    const [
      featuredOrHomeUniversities,
      trendingUniversities,
      totalUniversities,
      totalCourses,
      courseCategories,
      pageContent,
    ] = await Promise.all([
      prisma.$queryRawUnsafe(
        `
        SELECT
          u.id,
          u.name,
          u.uname,
          u.logo_path,
          u.banner_path,
          u.city,
          u.qs_rank,
          CAST(u.rating AS CHAR) AS rating,
          it.type AS institute_type
        FROM universities u
        LEFT JOIN institute_types it ON it.id = u.institute_type
        WHERE u.status = 1
          AND u.website = ?
          AND (u.featured = 1 OR u.homeview = 1)
        ORDER BY u.name ASC
        LIMIT 12
        `,
        website,
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `
        SELECT
          u.id,
          u.name,
          u.uname,
          u.logo_path,
          u.banner_path,
          u.city,
          u.qs_rank,
          CAST(u.rating AS CHAR) AS rating,
          it.type AS institute_type
        FROM universities u
        LEFT JOIN institute_types it ON it.id = u.institute_type
        WHERE u.status = 1
          AND u.website = ?
        ORDER BY COALESCE(u.click, 0) DESC, u.name ASC
        LIMIT 12
        `,
        website,
      ) as Promise<any[]>,
      prisma.university.count({ where: { status: 1 as any } }),
      prisma.universityProgram.count({ where: { status: 1 as any } }),
      prisma.courseCategory.findMany({
        where: { status: 1 as any },
        select: { id: true, name: true, slug: true, og_image_path: true },
        orderBy: { name: 'asc' },
      }),
      prisma.$queryRawUnsafe(
        `
        SELECT id, page_name, heading, description, author_id, status, website, created_at, updated_at
        FROM page_contents
        WHERE page_name = 'home'
        ORDER BY id ASC
        `,
      ) as Promise<any[]>,
    ])

    const featuredUniversities =
      featuredOrHomeUniversities.length > 0
        ? featuredOrHomeUniversities
        : trendingUniversities

    return serializeBigInt({
      featuredUniversities,
      totalUniversities,
      totalCourses,
      courseCategories,
      pageContent,
    })
  },
  ['home-page-data'],
  { revalidate: 43200 },
)

export const getPageBanner = unstable_cache(
  (uri: string) =>
    prisma.pageBanner.findFirst({ where: { page: uri } }),
  ['page-banner'],
  { revalidate: 86400 },
)

export const getPageContent = unstable_cache(
  (pageName: string) =>
    prisma.$queryRawUnsafe(
      `
      SELECT id, page_name, heading, description, author_id, status, website, created_at, updated_at
      FROM page_contents
      WHERE page_name = ?
      ORDER BY id ASC
      `,
      pageName,
    ),
  ['page-content'],
  { revalidate: 43200 },
)

export const getFaqs = unstable_cache(
  (categorySlug?: string) =>
    categorySlug
      ? prisma.faq.findMany({
          where: { category: { category_slug: categorySlug } },
          include: { category: true },
          orderBy: { id: 'asc' },
        })
      : prisma.faq.findMany({
          include: { category: true },
          orderBy: { id: 'asc' },
        }),
  ['faqs'],
  { revalidate: 86400 },
)

export const getHeroBanners = unstable_cache(
  async () => {
    const website = process.env.SITE_VAR || 'MYS'
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT id, title, description, banner_path, alt_text
      FROM page_banners
      WHERE page = 'home'
        AND website = ?
        AND banner_path IS NOT NULL
        AND TRIM(banner_path) <> ''
      ORDER BY id DESC
      `,
      website,
    ) as any[]

    return serializeBigInt(rows) as Array<{
      id: number
      title: string | null
      description: string | null
      banner_path: string
      alt_text: string | null
    }>
  },
  ['hero-banners'],
  { revalidate: 21600 },
)
