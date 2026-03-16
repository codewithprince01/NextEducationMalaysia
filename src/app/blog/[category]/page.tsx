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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params
  let initialData = null
  try {
    const res = await fetch(`${API_BASE}/blog-by-category/${category}?page=1&per_page=12`, { next: { revalidate: 21600 } })
    const json = await res.json()
    initialData = json.blogs || json
  } catch (e) {
    console.error('Failed to fetch initial category blogs:', e)
  }

  return <BlogListClient initialCategory={category} initialData={initialData} />
}
