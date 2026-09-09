import UniversitiesHubClient from './UniversitiesHubClient'

// Rendered per request so an edit saved in the admin panel is live immediately.
// The expensive queries behind this page stay cached and are keyed on a cheap
// database freshness probe, so they only re-run when the content actually
// changed. See src/lib/queries/contentVersion.ts.
export const revalidate = 0

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
