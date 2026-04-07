import UniversitiesHubClient from './UniversitiesHubClient'

export const revalidate = 86400

import { getUniversitiesByType } from '@/lib/queries/universities'
import { serializeBigInt } from '@/lib/utils'

export default async function UniversitiesPage() {
  const [publicUnis, privateUnis, foreignUnis] = await Promise.all([
    getUniversitiesByType('public-institution-in-malaysia'),
    getUniversitiesByType('private-institution-in-malaysia'),
    getUniversitiesByType('foreign-universities-in-malaysia'),
  ])

  const initialData = serializeBigInt({
    public: publicUnis as any[],
    private: privateUnis as any[],
    foreign: foreignUnis as any[],
  })

  return <UniversitiesHubClient pageTitle="TOP UNIVERSITIES IN MALAYSIA" initialData={initialData} />
}
