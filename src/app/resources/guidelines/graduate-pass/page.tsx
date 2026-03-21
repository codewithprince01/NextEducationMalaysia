import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import GraduatePassClient from './GraduatePassClient'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['Graduate Pass', 'resources-guidelines-graduate-pass'],
    '/resources/guidelines/graduate-pass',
    'Graduate Pass - Your Gateway to 12 Months in Malaysia | Education Malaysia',
  )
}

export default function GraduatePassPage() {
  return <GraduatePassClient />
}
