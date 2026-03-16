import { notFound } from 'next/navigation'
import { getBlogBySlugAndId, getAllBlogSlugs } from '@/lib/queries/blogs'
import { resolveBlogMeta } from '@/lib/seo/metadata'
import { blogJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import BlogDetailClient from './BlogDetailClient'

export const revalidate = 21600

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
  const { slugWithId } = await params
  const parsed = parseSlugWithId(slugWithId)
  if (!parsed) return {}
  const blog = await getBlogBySlugAndId(parsed.slug, parsed.id)
  if (!blog) return {}
  return resolveBlogMeta(blog, parsed.id)
}

export default async function BlogDetailPage({ params }: Props) {
  const { category, slugWithId } = await params
  const parsed = parseSlugWithId(slugWithId)
  if (!parsed) notFound()

  const blog = await getBlogBySlugAndId(parsed.slug, parsed.id)
  if (!blog) notFound()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
  let initialData = null
  try {
    const res = await fetch(`${API_BASE}/blog-details/${category}/${slugWithId}`, { next: { revalidate: 21600 } })
    initialData = await res.json()
  } catch (e) {
    console.error('Failed to fetch full blog data on server:', e)
  }

  return (
    <>
      <JsonLd data={blogJsonLd(blog, parsed.id)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), url: `${SITE_URL}/blog/${category}` },
        { name: blog.headline || '', url: `${SITE_URL}/blog/${category}/${slugWithId}` }
      ])} />
      <BlogDetailClient category={category} slugWithId={slugWithId} initialData={initialData} />
    </>
  )
}
