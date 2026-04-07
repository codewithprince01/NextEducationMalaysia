import { resolveStaticMeta } from '@/lib/seo/metadata'
import PartnerApplicationClient from './PartnerApplicationClient'

export async function generateMetadata() {
  return resolveStaticMeta('Become a Partner', '/become-a-partner')
}

export default async function PartnerApplicationPage() {
  return <PartnerApplicationClient />
}
