import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import PartnerApplicationClient from './PartnerApplicationClient'

export async function generateMetadata() {
  return resolveStaticMeta('Become a Partner', '/become-a-partner')
}

export default async function PartnerApplicationPage() {
  const meta = await resolveStaticMeta('Become a Partner', '/become-a-partner')
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Become a Partner', url: `${SITE_URL}/become-a-partner` }
      ], { name: title, description })} />
      <PartnerApplicationClient />
    </>
  )
}
