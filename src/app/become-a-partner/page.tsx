import { resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import PartnerApplicationClient from './PartnerApplicationClient'

export async function generateMetadata() {
  return resolveStaticMeta('Become a Partner', '/become-a-partner')
}

export default function PartnerApplicationPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Become a Partner', url: `${SITE_URL}/become-a-partner` }
      ])} />
      <PartnerApplicationClient />
    </>
  )
}
