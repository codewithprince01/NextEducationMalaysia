import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import SpecializationListClient, { type SpecializationListInitialData } from './SpecializationListClient'

export const revalidate = 86400

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['specialization', 'Specializations', 'specializations'],
    '/specialization',
    'Specializations - Courses in Malaysia',
  )
}

async function getSpecializationInitialData(): Promise<SpecializationListInitialData | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ''
  const apiKey = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
  if (!apiBase || !apiKey) return null

  try {
    const headers = { 'x-api-key': apiKey }
    const [categoriesRes, specializationsRes, pageContentRes] = await Promise.all([
      fetch(`${apiBase}/specializations/course-categories`, {
        headers,
        next: { revalidate },
      }),
      fetch(`${apiBase}/specializations`, {
        headers,
        next: { revalidate },
      }),
      fetch(`${apiBase}/page-contents/specialization`, {
        headers,
        next: { revalidate },
      }),
    ])

    if (!categoriesRes.ok || !specializationsRes.ok || !pageContentRes.ok) return null

    const [categoriesJson, specializationsJson, pageContentJson] = await Promise.all([
      categoriesRes.json(),
      specializationsRes.json(),
      pageContentRes.json(),
    ])

    const categories = Array.isArray(categoriesJson?.data) ? categoriesJson.data : []
    const specializations = Array.isArray(specializationsJson?.data) ? specializationsJson.data : []
    const pageContent = pageContentJson?.data || null

    return {
      categories,
      specializations,
      pageContent,
    }
  } catch {
    return null
  }
}

export default async function SpecializationListPage() {
  const initialData = await getSpecializationInitialData()
  return <SpecializationListClient initialData={initialData} />
}
