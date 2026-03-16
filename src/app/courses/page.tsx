import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import QualificationsHubClient from './QualificationsHubClient'

export const metadata: Metadata = {
  title: 'Choose Your Qualification Level | Education Malaysia',
  description: 'Select your current qualification level to find the best foundation, diploma, degree, or postgraduate courses in Malaysia.',
  alternates: {
    canonical: `${SITE_URL}/courses`,
  },
}

export default function QualificationsHubPage() {
  return <QualificationsHubClient />
}
