import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export const getAllUniversitySlugs = unstable_cache(
  () =>
    prisma.university.findMany({
      where: { status: true as any },
      select: { uname: true },
    }).then(rows => rows.map(r => r.uname).filter(Boolean) as string[]),
  ['university-slugs'],
  { revalidate: 86400 },
)

export const getUniversityBySlug = unstable_cache(
  (slug: string) =>
    prisma.university.findFirst({
      where: { uname: slug, status: true as any },
      include: {
        instituteType: { select: { type: true } },
        photos: { where: { is_featured: true as any }, take: 1 },
      } as any,
    }),
  ['university-detail'],
  { revalidate: 86400, tags: ['university'] },
)

export const getUniversityFull = unstable_cache(
  (slug: string) =>
    prisma.university.findFirst({
      where: { uname: slug, status: true as any },
      include: {
        instituteType: { select: { type: true } },
        photos: { orderBy: { is_featured: 'desc' } },
        overviews: { orderBy: { position: 'asc' } },
      } as any,
    }),
  ['university-full'],
  { revalidate: 3600, tags: ['university'] },
)

export const getUniversityOverviews = unstable_cache(
  (universityId: number) =>
    prisma.universityOverview.findMany({
      where: { university_id: universityId },
      orderBy: { position: 'asc' },
    }),
  ['university-overviews'],
  { revalidate: 86400 },
)

export const getUniversityCourses = unstable_cache(
  (universityId: number) =>
    prisma.universityProgram.findMany({
      where: { university_id: universityId, status: true as any },
      select: {
        id: true,
        course_name: true,
        slug: true,
        level: true,
        duration: true,
        tution_fee: true,
        intake: true,
      },
      orderBy: { course_name: 'asc' },
    }),
  ['university-courses'],
  { revalidate: 86400 },
)

export const getUniversityPhotos = (universityId: number) =>
  prisma.universityPhoto.findMany({
    where: { university_id: universityId },
    orderBy: { is_featured: 'desc' },
  })

export const getUniversityVideos = (universityId: number) =>
  prisma.universityVideo.findMany({
    where: { university_id: universityId },
  })

export const getUniversityReviews = (universityId: number) =>
  prisma.review.findMany({
    where: { university_id: universityId, status: true as any },
    orderBy: { created_at: 'desc' },
  })

export const getUniversityRankings = (universityId: number) =>
  prisma.universityRanking.findMany({
    where: { university_id: universityId },
    orderBy: { position: 'asc' },
  })

export const getUniversityScholarships = (universityId: number) =>
  prisma.universityScholarship.findMany({
    where: { u_id: universityId, status: true as any },
  })

export const getFeaturedUniversities = unstable_cache(
  () =>
    prisma.university.findMany({
      where: { status: true as any, featured: true as any },
      select: {
        id: true,
        name: true,
        uname: true,
        logo_path: true,
        banner_path: true,
        city: true,
        state: true,
        qs_rank: true,
        established_year: true,
        rating: true,
        instituteType: { select: { type: true } },
      } as any,
      orderBy: { name: 'asc' },
      take: 12,
    }),
  ['featured-universities'],
  { revalidate: 86400 },
)

export const getUniversitiesByType = unstable_cache(
  (typeSlug: string) =>
    prisma.university.findMany({
      where: {
        status: true as any,
        instituteType: { slug: typeSlug },
      },
      select: {
        id: true,
        name: true,
        uname: true,
        logo_path: true,
        city: true,
        state: true,
        qs_rank: true,
        rating: true,
      },
      orderBy: { name: 'asc' },
    }),
  ['universities-by-type'],
  { revalidate: 86400 },
)

export const getUniversityBySearch = (query: string) =>
  prisma.university.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { uname: { contains: query } },
      ],
      status: true as any,
    },
    select: {
      id: true,
      name: true,
      uname: true,
      logo_path: true,
    },
    take: 10,
  })

export const getUniversityPrograms = (universityId: number) =>
  prisma.universityProgram.findMany({
    where: { university_id: universityId, status: true as any },
    include: {
      courseCategory: true,
    },
  })

export const getAllUniversities = unstable_cache(
  () =>
    prisma.university.findMany({
      where: { status: true as any },
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
    }),
  ['all-universities'],
  { revalidate: 86400 },
)

export const getInstituteTypes = unstable_cache(
  () =>
    prisma.instituteType.findMany({
      select: { id: true, type: true, slug: true, seo_title_slug: true },
    }),
  ['institute-types'],
  { revalidate: 86400 },
)
