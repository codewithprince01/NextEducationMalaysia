import { Metadata } from 'next'
import NationalityStatsClient from '@/components/home/NationalityStatsClient'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Global Footprint of International Students in Malaysia - Nationality Trends',
  description: 'Analysis of international student enrollment in Malaysia by country of origin. Interactive data from official EMGS statistics.',
  alternates: { canonical: `${SITE_URL}/nationality-stats` }
}

export default function NationalityStatsPage() {
  return (
    <main>
      <NationalityStatsClient />
    </main>
  )
}
