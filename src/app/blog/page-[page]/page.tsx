import { Metadata } from 'next'
import { headers } from 'next/headers'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from '../BlogListClient'

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
  const pageNum = await resolvePageNum(resolvedParams)

  return {
    title: pageNum > 1 ? `Blog - Page ${pageNum} | Education Malaysia` : 'Blog - Education Malaysia',
    description:
      'Latest news, guides, and tips about studying in Malaysia. Read articles on universities, scholarships, visa, and student life.',
    alternates: { canonical: pageNum > 1 ? `${SITE_URL}/blog/page-${pageNum}` : `${SITE_URL}/blog` },
  }
}

export default async function BlogListPageWithPagination({ params }: Props) {
  const resolvedParams = await params
  const pageNum = await resolvePageNum(resolvedParams)
  const result = await blogService.getBlogs(pageNum, 12)
  return <BlogListClient initialData={result} />
}

