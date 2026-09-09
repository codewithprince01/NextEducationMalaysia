import { prisma } from '@/lib/db'
import { cachedByContent } from './contentVersion'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getAllScholarshipSlugs = cachedByContent(
  'scholarship',
  ['scholarship-slugs'],
  () =>
    prisma.scholarship.findMany({
      select: { slug: true },
    }).then(rows => rows.map(r => r.slug).filter(Boolean) as string[]),
  { revalidate: 86400 }
)

export const getScholarshipBySlug = cachedByContent(
  'scholarship',
  ['scholarship-detail'],
  (slug: string) =>
    prisma.scholarship.findFirst({
      where: { slug },
      include: {
        contents: { orderBy: { id: 'asc' } },
      },
    }).then(serializeBigInt),
  { revalidate: 86400, tags: ['scholarship'] }
)

export const getAllScholarships = cachedByContent(
  'scholarship',
  ['all-scholarships'],
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
  { revalidate: 86400 }
)
