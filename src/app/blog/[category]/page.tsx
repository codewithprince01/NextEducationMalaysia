import { notFound, redirect } from 'next/navigation'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from '../BlogListClient'

export const revalidate = 21600

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props) {
  const { category } = await params
  const pageMatch = category.match(/^page-(\d+)$/)
  if (pageMatch) {
    const pageNum = Number.parseInt(pageMatch[1], 10) || 1
    return {
      title: pageNum > 1 ? `Blog - Page ${pageNum} | Education Malaysia` : 'Blog - Education Malaysia',
      description: 'Latest news, guides, and tips about studying in Malaysia. Read articles on universities, scholarships, visa, and student life.',
      alternates: { canonical: pageNum > 1 ? `${SITE_URL}/blog/page-${pageNum}` : `${SITE_URL}/blog` },
    }
  }

  const title = category
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return {
    title: `${title} - Blog | Education Malaysia`,
    description: `Read the latest ${title} articles and guides for international students in Malaysia.`,
    alternates: { canonical: `${SITE_URL}/blog/${category}` },
  }
}

import { blogService } from '@/backend'

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params

  const pageMatch = category.match(/^page-(\d+)$/)
  if (pageMatch) {
    const pageNum = Number.parseInt(pageMatch[1], 10) || 1
    const result = await blogService.getBlogs(pageNum, 12)
    if (result?.pagination?.last_page && pageNum > result.pagination.last_page) {
      redirect('/blog')
    }
    return <BlogListClient initialData={result} />
  }

  const result = await blogService.getBlogsByCategory(category, 1, 12)
  
  if (!result) return notFound()

  return <BlogListClient initialCategory={category} initialData={result} />
}
