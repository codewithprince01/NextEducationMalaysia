import { notFound, redirect } from 'next/navigation'
import { getBlogBySlugAndId, getAllBlogSlugs } from '@/lib/queries/blogs'
import { resolveBlogMeta } from '@/lib/seo/metadata'
import { blogJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import BlogDetailClient from './BlogDetailClient'
import { serializeBigInt } from '@/lib/utils'
import BlogListClient from '../../BlogListClient'
import { prisma } from '@/lib/db-fresh'

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
  const blog = await getBlogBySlugAndId(parsed.slug, parsed.id)
  if (!blog) return {}
  return resolveBlogMeta(blog, parsed.id)
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
  const canonical = await prisma.blog.findFirst({
    where: { id: parsed.id, status: 1 },
    select: {
      id: true,
      slug: true,
      category: { select: { category_slug: true } },
    },
  })
  if (!canonical?.slug) {
    return <BlogDetailClient category={category} slugWithId={slugWithId} />
  }

  const canonicalCategory = canonical.category?.category_slug || category
  const canonicalUrl = `/blog/${canonicalCategory}/${canonical.slug}-${canonical.id}`
  if ((canonical.category?.category_slug && canonical.category.category_slug !== category) || canonical.slug !== parsed.slug) {
    redirect(canonicalUrl)
  }

  const result = await blogService.getBlogDetail(canonicalCategory, `${canonical.slug}-${canonical.id}`)
  if (!result) {
    const fallbackBlog = await getBlogBySlugAndId(canonical.slug, Number(canonical.id))
    if (!fallbackBlog) {
      return <BlogDetailClient category={category} slugWithId={slugWithId} />
    }

    const fallbackData = {
      data: fallbackBlog,
      related_blogs: [],
      categories: [],
      specializations: [],
    }

    return (
      <>
        <JsonLd data={blogJsonLd(fallbackData.data, parsed.id)} />
        <JsonLd data={breadcrumbJsonLd([
          { name: 'Home', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), url: `${SITE_URL}/blog/${category}` },
          { name: fallbackData.data.headline || '', url: `${SITE_URL}/blog/${category}/${slugWithId}` }
        ])} />
        <BlogDetailClient category={category} slugWithId={slugWithId} initialData={fallbackData} />
      </>
    )
  }

  return (
    <>
      <JsonLd data={blogJsonLd(result.data, parsed.id)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), url: `${SITE_URL}/blog/${category}` },
        { name: result.data.headline || '', url: `${SITE_URL}/blog/${category}/${slugWithId}` }
      ])} />
      <BlogDetailClient category={category} slugWithId={slugWithId} initialData={result} />
    </>
  )
}
