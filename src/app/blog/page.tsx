import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from './BlogListClient'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 21600 // 6 hours

export const metadata: Metadata = {
  title: 'Blog - Education Malaysia',
  description: 'Latest news, guides, and tips about studying in Malaysia. Read articles on universities, scholarships, visa, and student life.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

import { blogService } from '@/backend'

export default async function BlogListPage() {
  const result = await blogService.getBlogs(1, 12)
  
  return <BlogListClient initialData={result} />
}
