import { notFound, redirect } from 'next/navigation'
import { getBlogBySlugAndId, getAllBlogSlugs } from '@/lib/queries/blogs'
import { resolveBlogMeta } from '@/lib/seo/metadata'
import FaqSection from '@/components/seo/FaqSection'
import { SITE_URL } from '@/lib/constants'
import BlogDetailClient from './BlogDetailClient'
import BlogListClient from '../../BlogListClient'
import { prisma } from '@/lib/db-fresh'
import { normalizeFaqs } from '@/lib/seo/faq-schema'

export const revalidate = 21600
export const dynamicParams = true
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ category: string; slugWithId: string }> }

function parseSlugWithId(slugWithId: string) {
  const lastDash = slugWithId.lastIndexOf('-')
  if (lastDash === -1) return null
  const id = parseInt(slugWithId.substring(lastDash + 1), 10)
  if (isNaN(id)) return null
  const slug = slugWithId.substring(0, lastDash)
  return { slug, id }
}

export async function generateStaticParams() {
  const all = await getAllBlogSlugs()
  return all.map((b: { category: string; slugWithId: string }) => ({
    category: b.category,
    slugWithId: b.slugWithId,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { category, slugWithId } = await params
  const pageMatch = slugWithId.match(/^page-(\d+)$/)
  if (pageMatch) {
    const pageNum = Number.parseInt(pageMatch[1], 10) || 1
    const title = category
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return {
      title: pageNum > 1 ? `${title} - Blog Page ${pageNum} | Education Malaysia` : `${title} - Blog | Education Malaysia`,
      description: `Read the latest ${title} articles and guides for international students in Malaysia.`,
      alternates: { canonical: pageNum > 1 ? `${SITE_URL}/blog/${category}/page-${pageNum}` : `${SITE_URL}/blog/${category}` },
    }
  }
  const parsed = parseSlugWithId(slugWithId)
  if (!parsed) return {}
  try {
    const blog = await getBlogBySlugAndId(parsed.slug, parsed.id)
    if (!blog) return {}
    return resolveBlogMeta(blog, parsed.id)
  } catch {
    return {}
  }
}

import { blogService } from '@/backend'

export default async function BlogDetailPage({ params }: Props) {
  const { category, slugWithId } = await params
  const pageMatch = slugWithId.match(/^page-(\d+)$/)
  if (pageMatch) {
    const pageNum = Number.parseInt(pageMatch[1], 10) || 1
    const result = await blogService.getBlogsByCategory(category, pageNum, 12)
    if (!result) notFound()
    if (result?.pagination?.last_page && pageNum > result.pagination.last_page) {
      redirect(`/blog/${category}`)
    }
    return <BlogListClient initialCategory={category} initialData={result} />
  }

  const parsed = parseSlugWithId(slugWithId)
  if (!parsed) {
    return <BlogDetailClient category={category} slugWithId={slugWithId} />
  }
  // Resolve by ID first for robust client navigation and canonical redirects.
  let canonical: { id: number; slug: string | null; category: { category_slug: string | null } | null } | null = null
  try {
    canonical = await prisma.blog.findFirst({
      where: { id: parsed.id, status: 1 },
      select: {
        id: true,
        slug: true,
        category: { select: { category_slug: true } },
      },
    })
  } catch {
    canonical = null
  }
  if (!canonical?.slug) {
    return <BlogDetailClient category={category} slugWithId={slugWithId} />
  }

  const canonicalCategory = canonical.category?.category_slug || category
  const canonicalUrl = `/blog/${canonicalCategory}/${canonical.slug}-${canonical.id}`
  if ((canonical.category?.category_slug && canonical.category.category_slug !== category) || canonical.slug !== parsed.slug) {
    redirect(canonicalUrl)
  }

  let result: Awaited<ReturnType<typeof blogService.getBlogDetail>> = null
  try {
    result = await blogService.getBlogDetail(canonicalCategory, `${canonical.slug}-${canonical.id}`)
  } catch {
    result = null
  }
  if (!result) {
    let fallbackBlog: Awaited<ReturnType<typeof getBlogBySlugAndId>> = null
    try {
      fallbackBlog = await getBlogBySlugAndId(canonical.slug, Number(canonical.id))
    } catch {
      fallbackBlog = null
    }
    if (!fallbackBlog) {
      return <BlogDetailClient category={category} slugWithId={slugWithId} />
    }

    const fallbackData = {
      data: fallbackBlog,
      related_blogs: [],
      categories: [],
      specializations: [],
      faqs: [],
    }
    let fallbackFaqRows: Array<{ question: string | null; answer: string | null; position: number | null; id: number }> = []
    try {
      fallbackFaqRows = await prisma.blogFaq.findMany({
        where: { blog_id: Number((fallbackData.data as any).id) },
        select: { question: true, answer: true, position: true, id: true },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
      })
    } catch {
      fallbackFaqRows = []
    }
    const fallbackFaqItems = normalizeFaqs(fallbackFaqRows as any[])

    return (
      <>
        <BlogDetailClient category={category} slugWithId={slugWithId} initialData={fallbackData} />
        <FaqSection title="Blog FAQs" faqs={fallbackFaqItems} />
      </>
    )
  }
  const faqItems = normalizeFaqs(((result as any).faqs || []) as any[])

  return (
    <>
      <BlogDetailClient category={category} slugWithId={slugWithId} initialData={result} />
      <FaqSection title="Blog FAQs" faqs={faqItems} />
    </>
  )
}
