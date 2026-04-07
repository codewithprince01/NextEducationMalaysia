import { resolveStaticMeta } from '@/lib/seo/metadata'
import PartnersClient from './PartnersClient'

export async function generateMetadata() {
  return resolveStaticMeta('Our Partners', '/view-our-partners')
}

export default async function ViewOurPartnersPage() {
  return <PartnersClient />
}
