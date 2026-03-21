import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import UniversitiesHubClient from './UniversitiesHubClient'

export const revalidate = 86400

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['universities', 'Top Universities in Malaysia', 'universities-in-malaysia'],
    '/universities',
    'Top Universities in Malaysia - Education Malaysia',
  )
}

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
