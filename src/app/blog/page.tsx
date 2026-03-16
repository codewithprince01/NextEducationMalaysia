import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import BlogListClient from './BlogListClient'

export const revalidate = 21600 // 6 hours

export const metadata: Metadata = {
  title: 'Blog - Education Malaysia',
  description: 'Latest news, guides, and tips about studying in Malaysia. Read articles on universities, scholarships, visa, and student life.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default async function BlogListPage() {
  let initialData = null
  try {
    const res = await fetch(`${API_BASE}/blog?page=1&per_page=12`, { next: { revalidate: 21600 } })
    const json = await res.json()
    initialData = json.blogs || json
  } catch (e) {
    console.error('Failed to fetch initial blogs:', e)
  }

  return <BlogListClient initialData={initialData} />
}
