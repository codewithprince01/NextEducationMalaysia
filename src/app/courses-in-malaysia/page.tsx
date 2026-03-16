import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from './CoursesListClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Courses in Malaysia - Find the Best Programs | Education Malaysia',
  description: 'Explore thousands of courses and programs offered at universities across Malaysia. Filter by level, specialization, intake and more. Find your ideal course today.',
  alternates: { canonical: `${SITE_URL}/courses-in-malaysia` },
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'

export default async function CoursesPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const page = params.page || '1'
  
  // Build query for initial fetch
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('per_page', '10')
  qs.set('sort_by', params.sort_by || 'rating')
  if (params.search) qs.set('search', params.search)
  
  // Pass list filters if present
  const filterKeys = ['levels', 'categories', 'specializations', 'intakes', 'study_modes']
  filterKeys.forEach(key => {
    const val = params[key]
    if (Array.isArray(val)) val.forEach(v => qs.append(`${key}[]`, v))
    else if (val) qs.append(`${key}[]`, val)
  })

  // Fetch in parallel
  const [filtersRes, coursesRes] = await Promise.all([
    fetch(`${API_BASE}/courses/filters`, { next: { revalidate: 86400 } }),
    fetch(`${API_BASE}/courses?${qs.toString()}`, { next: { revalidate: 3600 } })
  ])

  let filterData = {}
  let coursesData = null

  try {
    const fJson = await filtersRes.json()
    filterData = fJson.data || fJson
    
    const cJson = await coursesRes.json()
    coursesData = cJson.data || cJson
  } catch (e) {
    console.error('Failed to fetch initial course data:', e)
  }

  return (
    <CoursesListClient 
      initialFilterData={filterData} 
      initialCoursesData={coursesData}
      initialLevel={params.levels}
      initialCategory={params.categories}
    />
  )
}
