import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import PartnersClient from './PartnersClient'

export async function generateMetadata() {
  return resolveStaticMeta('Our Partners', '/view-our-partners')
}

export default async function ViewOurPartnersPage() {
  const meta = await resolveStaticMeta('Our Partners', '/view-our-partners')
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Our Partners', url: `${SITE_URL}/view-our-partners` }
      ], { name: title, description })} />
      <PartnersClient />
    </>
  )
}
