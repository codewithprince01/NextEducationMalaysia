import { prisma } from '@/lib/db-fresh'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getAllCourseCategorySlugs = unstable_cache(
  () =>
    prisma.courseCategory.findMany({
      where: { status: true as any },
      select: { slug: true },
    }).then(rows => rows.map(r => r.slug).filter(Boolean) as string[]),
  ['course-category-slugs'],
  { revalidate: 86400 },
)

export const getCourseCategory = unstable_cache(
  (slug: string) =>
    prisma.courseCategory.findFirst({
      where: { slug, status: true as any },
      include: {
        contents: { orderBy: { position: 'asc' } },
        faqs: { orderBy: { id: 'asc' } },
        specializations: {
          where: { status: true as any },
          select: { id: true, name: true, slug: true },
          orderBy: { name: 'asc' },
        },
      },
    }).then(serializeBigInt),
  ['course-category-detail'],
  { revalidate: 86400, tags: ['course'] },
)

export const getAllCourseCategories = unstable_cache(
  () =>
    prisma.courseCategory.findMany({
      where: { status: true as any },
      select: {
        id: true,
        name: true,
        slug: true,
        og_image_path: true,
        _count: { select: { programs: { where: { status: true as any } } } },
      },
      orderBy: { name: 'asc' },
    }).then(serializeBigInt),
  ['all-course-categories'],
  { revalidate: 86400 },
)

export const getLevels = unstable_cache(
  () =>
    prisma.level.findMany({
      select: { id: true, level: true, slug: true },
      orderBy: { id: 'asc' },
    }).then(serializeBigInt),
  ['levels'],
  { revalidate: 86400 },
)

export const getProgramBySlug = unstable_cache(
  (slug: string) =>
    prisma.universityProgram.findFirst({
      where: { slug, status: true as any },
      include: {
        university: { select: { id: true, name: true, uname: true, logo_path: true } },
        courseCategory: { select: { name: true, slug: true } },
        courseSpecialization: { select: { name: true, slug: true } },
        contents: { orderBy: { id: 'asc' } },
      },
    }).then(serializeBigInt),
  ['program-detail'],
  { revalidate: 86400 },
)
