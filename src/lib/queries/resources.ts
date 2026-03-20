import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

export const getExamBySlug = unstable_cache(
  (slug: string) =>
    prisma.exam.findFirst({
      where: { uri: slug } as any,
      include: {
        exam_page_contents: { orderBy: { id: 'asc' } },
        faqs: { orderBy: { id: 'asc' } },
      } as any,
    }).then(serializeBigInt),
  ['exam-detail'],
  { revalidate: 86400 },
)

export const getAllExams = unstable_cache(
  () =>
    prisma.exam.findMany({
      select: { id: true, headline: true, uri: true, imgpath: true } as any,
    }).then(serializeBigInt),
  ['all-exams'],
  { revalidate: 86400 },
)

export const getServiceBySlug = unstable_cache(
  (slug: string) =>
    prisma.service.findFirst({
      where: { slug: slug, status: true as any } as any,
    }).then(serializeBigInt),
  ['service-detail'],
  { revalidate: 86400 },
)

export const getAllServices = unstable_cache(
  () =>
    prisma.service.findMany({
      where: { status: true as any } as any,
      select: { id: true, headline: true, slug: true, description: true, imgpath: true } as any,
    }).then(serializeBigInt),
  ['all-services'],
  { revalidate: 86400 },
)
