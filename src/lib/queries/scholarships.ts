import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getAllScholarshipSlugs = unstable_cache(
  () =>
    prisma.scholarship.findMany({
      select: { slug: true },
    }).then(rows => rows.map(r => r.slug).filter(Boolean) as string[]),
  ['scholarship-slugs'],
  { revalidate: 86400 },
)

export const getScholarshipBySlug = unstable_cache(
  (slug: string) =>
    prisma.scholarship.findFirst({
      where: { slug },
      include: {
        contents: { orderBy: { id: 'asc' } },
        faqs: { orderBy: { id: 'asc' } },
      },
    }).then(serializeBigInt),
  ['scholarship-detail'],
  { revalidate: 86400, tags: ['scholarship'] },
)

export const getAllScholarships = unstable_cache(
  () =>
    prisma.scholarship.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        shortnote: true,
        thumbnail_path: true,
      },
    }).then(serializeBigInt),
  ['all-scholarships'],
  { revalidate: 86400 },
)
