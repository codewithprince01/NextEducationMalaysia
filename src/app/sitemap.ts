import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    universities, 
    blogs, 
    categories, 
    specializations, 
    scholarships,
    exams,
    services
  ] = await Promise.all([
    prisma.university.findMany({
      where: { status: true as any },
      select: { uname: true, updated_at: true },
    }),
    prisma.blog.findMany({
      where: { status: true } as any,
      select: { id: true, slug: true, updated_at: true, category: { select: { category_slug: true } } } as any,
    }) as any,
    prisma.courseCategory.findMany({
      where: { status: true } as any,
      select: { slug: true, updated_at: true } as any,
    }) as any,
    prisma.courseSpecialization.findMany({
      where: { status: true } as any,
      select: { slug: true, updated_at: true } as any,
    }) as any,
    prisma.scholarship.findMany({
      select: { slug: true, updated_at: true } as any,
    }) as any,
    prisma.exam.findMany({
      select: { uri: true, updated_at: true } as any,
    }) as any,
    prisma.service.findMany({
      select: { slug: true, updated_at: true } as any,
    }) as any,
  ]) as any[]

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/study-in-malaysia`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/who-we-are`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/universities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/courses-in-malaysia`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/scholarships`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/resources`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/resources/exams`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/resources/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faqs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  const universityUrls: MetadataRoute.Sitemap = universities
    .filter((u: any) => u.uname)
    .map((u: any) => ({
      url: `${SITE_URL}/university/${u.uname}`,
      lastModified: u.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const blogUrls: MetadataRoute.Sitemap = blogs
    .filter((b: any) => b.slug && b.category?.category_slug)
    .map((b: any) => ({
      url: `${SITE_URL}/blog/${b.category!.category_slug}/${b.slug}-${b.id}`,
      lastModified: b.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c: any) => c.slug)
    .map((c: any) => ({
      url: `${SITE_URL}/course/${c.slug}`,
      lastModified: c.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const specUrls: MetadataRoute.Sitemap = specializations
    .filter((s: any) => s.slug)
    .map((s: any) => ({
      url: `${SITE_URL}/specialization/${s.slug}`,
      lastModified: s.updated_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const scholarshipUrls: MetadataRoute.Sitemap = scholarships
    .filter((s: any) => s.slug)
    .map((s: any) => ({
      url: `${SITE_URL}/scholarships/${s.slug}`,
      lastModified: s.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  const examUrls: MetadataRoute.Sitemap = exams
    .filter((e: any) => e.uri)
    .map((e: any) => ({
      url: `${SITE_URL}/resources/exams/${e.uri}`,
      lastModified: e.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }))

  const serviceUrls: MetadataRoute.Sitemap = services
    .filter((s: any) => s.slug)
    .map((s: any) => ({
      url: `${SITE_URL}/resources/services/${s.slug}`,
      lastModified: s.updated_at || new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }))

  return [
    ...staticPages,
    ...universityUrls,
    ...blogUrls,
    ...categoryUrls,
    ...specUrls,
    ...scholarshipUrls,
    ...examUrls,
    ...serviceUrls,
  ]
}
