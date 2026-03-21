import NationalityStatsClient from '@/components/home/NationalityStatsClient'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['nationality-stats', 'Nationality Stats', 'global-footprint'],
    '/nationality-stats',
    'Global Footprint of International Students in Malaysia - Nationality Trends',
  )
}

export default function NationalityStatsPage() {
  return (
    <main>
      <NationalityStatsClient />
    </main>
  )
}
