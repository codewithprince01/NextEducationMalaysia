import { notFound } from 'next/navigation'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from '../BlogListClient'

export const revalidate = 21600

type Props = { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props) {
  const { category } = await params
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
  const result = await blogService.getBlogsByCategory(category, 1, 12)
  
  if (!result) return notFound()

  return <BlogListClient initialCategory={category} initialData={result} />
}
