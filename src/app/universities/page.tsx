import { SITE_URL } from '@/lib/constants'
import { Metadata } from 'next'
import UniversitiesHubClient from './UniversitiesHubClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Top Universities in Malaysia - Education Malaysia',
  description: 'Explore the best universities in Malaysia. Compare rankings, fees, and courses. Find private, public, and foreign universities.',
  alternates: { canonical: `${SITE_URL}/universities` },
}

import { getUniversitiesByType } from '@/lib/queries/universities'

export default async function UniversitiesPage() {
  const [publicUnis, privateUnis, foreignUnis] = await Promise.all([
    getUniversitiesByType('public-institution-in-malaysia'),
    getUniversitiesByType('private-institution-in-malaysia'),
    getUniversitiesByType('foreign-universities-in-malaysia'),
  ])

  const initialData = {
    public: publicUnis as any[],
    private: privateUnis as any[],
    foreign: foreignUnis as any[],
  }

  return <UniversitiesHubClient pageTitle="TOP UNIVERSITIES IN MALAYSIA" initialData={initialData} />
}
