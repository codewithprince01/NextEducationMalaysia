import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export const getAllSpecializationSlugs = unstable_cache(
  () =>
    prisma.courseSpecialization.findMany({
      where: { status: true },
      select: { slug: true },
    }).then(rows => rows.map(r => r.slug).filter(Boolean) as string[]),
  ['specialization-slugs'],
  { revalidate: 86400 },
)

export const getSpecializationBySlug = unstable_cache(
  (slug: string) =>
    prisma.courseSpecialization.findFirst({
      where: { slug, status: true },
      include: {
        courseCategory: { select: { name: true, slug: true } },
        contents: { orderBy: { position: 'asc' } },
        faqs: { orderBy: { id: 'asc' } },
        specializationLevels: {
          select: { id: true, level: true, level_slug: true },
          orderBy: { id: 'asc' },
        },
      },
    }),
  ['specialization-detail'],
  { revalidate: 86400, tags: ['specialization'] },
)

export const getSpecializationLevel = unstable_cache(
  (specSlug: string, levelSlug: string) =>
    prisma.specializationLevel.findFirst({
      where: {
        level_slug: levelSlug,
        specialization: { slug: specSlug, status: true },
      },
      include: {
        specialization: { select: { name: true, slug: true } },
        contents: { orderBy: { position: 'asc' } },
      },
    }),
  ['specialization-level-detail'],
  { revalidate: 86400 },
)

export const getAllSpecializations = unstable_cache(
  () =>
    prisma.courseSpecialization.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        slug: true,
        banner_path: true,
        courseCategory: { select: { name: true, slug: true } },
        _count: { select: { programs: { where: { status: true } } } },
      },
      orderBy: { name: 'asc' },
    }),
  ['all-specializations'],
  { revalidate: 86400 },
)
