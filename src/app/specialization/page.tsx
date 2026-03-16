import { SITE_URL } from '@/lib/constants'
import { Metadata } from 'next'
import SpecializationListClient from './SpecializationListClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Specializations - Courses in Malaysia',
  description: 'Browse all course specializations available at universities in Malaysia.',
  alternates: { canonical: `${SITE_URL}/specialization` },
}

export default async function SpecializationListPage() {
  return <SpecializationListClient />
}
