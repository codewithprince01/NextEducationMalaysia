import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from '../../BlogListClient'

export const revalidate = 21600

type Props = { params: Promise<Record<string, string | undefined>> }

import { blogService } from '@/backend'

async function resolvePageNum(params: Record<string, string | undefined>) {
  const raw = Object.values(params).find((v) => typeof v === 'string' && v.includes('page-'))
  if (raw) {
    const normalized = raw.startsWith('page-') ? raw.replace('page-', '') : raw
    const num = Number.parseInt(normalized, 10)
    if (!Number.isNaN(num) && num > 0) return num
  }

  const h = await headers()
  const path = h.get('x-invoke-path') || h.get('next-url') || ''
  const last = path.split('/').filter(Boolean).pop() || ''
  if (last.startsWith('page-')) {
    const num = Number.parseInt(last.replace('page-', ''), 10)
    if (!Number.isNaN(num) && num > 0) return num
  }

  return 1
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const category = resolvedParams.category || 'blog'
  const pageNum = await resolvePageNum(resolvedParams)
  const title = category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    title:
      pageNum > 1
        ? `${title} - Blog Page ${pageNum} | Education Malaysia`
        : `${title} - Blog | Education Malaysia`,
    description: `Read the latest ${title} articles and guides for international students in Malaysia.`,
    alternates: {
      canonical: pageNum > 1 ? `${SITE_URL}/blog/${category}/page-${pageNum}` : `${SITE_URL}/blog/${category}`,
    },
  }
}

export default async function BlogCategoryPageWithPagination({ params }: Props) {
  const resolvedParams = await params
  const category = resolvedParams.category
  const pageNum = await resolvePageNum(resolvedParams)
  if (!category) return notFound()

  const result = await blogService.getBlogsByCategory(category, pageNum, 12)
  if (!result) return notFound()

  return <BlogListClient initialCategory={category} initialData={result} />
}

