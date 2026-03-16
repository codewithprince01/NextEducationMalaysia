import { Metadata } from 'next'
import FieldStudyClient from '@/components/home/FieldStudyClient'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Top Study Areas Preferred by International Students in Malaysia - EMGS Stats',
  description: 'Explore international student enrollment trends and popular fields of study in Malaysia using official EMGS data and interactive visualizations.',
  alternates: { canonical: `${SITE_URL}/field-study` }
}

export default function FieldStudyPage() {
  return (
    <main>
      <FieldStudyClient />
    </main>
  )
}
