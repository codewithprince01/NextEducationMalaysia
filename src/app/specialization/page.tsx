import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import SpecializationListClient from './SpecializationListClient'

export const revalidate = 86400

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['specialization', 'Specializations', 'specializations'],
    '/specialization',
    'Specializations - Courses in Malaysia',
  )
}

export default async function SpecializationListPage() {
  return <SpecializationListClient />
}
