import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export const getHomePageData = unstable_cache(
  async () => {
    const [
      featuredUniversities,
      totalUniversities,
      totalCourses,
      courseCategories,
      pageContent,
    ] = await Promise.all([
      prisma.university.findMany({
        where: { status: true as any, featured: true as any },
        select: {
          id: true,
          name: true,
          uname: true,
          logo_path: true,
          banner_path: true,
          city: true,
          qs_rank: true,
          rating: true,
          instituteType: { select: { type: true } },
        },
        orderBy: { name: 'asc' },
        take: 12,
      }),
      prisma.university.count({ where: { status: true as any } }),
      prisma.universityProgram.count({ where: { status: true as any } }),
      prisma.courseCategory.findMany({
        where: { status: true as any },
        select: { id: true, name: true, slug: true, og_image_path: true },
        orderBy: { name: 'asc' },
      }),
      prisma.pageContent.findMany({
        where: { page_name: 'home' },
        orderBy: { id: 'asc' },
      }),
    ])

    return {
      featuredUniversities,
      totalUniversities,
      totalCourses,
      courseCategories,
      pageContent,
    }
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
    prisma.pageContent.findMany({
      where: { page_name: pageName },
      orderBy: { id: 'asc' },
    }),
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
    // PageBanner model will be available after `npx prisma db pull` syncs the schema.
    // Until then, Hero uses the built-in fallback banner.
    return [] as Array<{
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

