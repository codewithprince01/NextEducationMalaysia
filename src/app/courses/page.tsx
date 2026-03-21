import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import QualificationsHubClient from './QualificationsHubClient'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['Courses', 'Choose Qualification', 'courses'],
    '/courses',
    'Choose Your Qualification Level | Education Malaysia',
  )
}

export default function QualificationsHubPage() {
  return <QualificationsHubClient />
}
