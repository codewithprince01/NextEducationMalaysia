import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import { Suspense } from 'react'
import QualificationsHubClient from './QualificationsHubClient'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['Courses', 'Choose Qualification', 'courses'],
    '/courses',
    'Choose Your Qualification Level | Education Malaysia',
  )
}

export default function QualificationsHubPage() {
  return (
    <Suspense fallback={null}>
      <QualificationsHubClient />
    </Suspense>
  )
}
