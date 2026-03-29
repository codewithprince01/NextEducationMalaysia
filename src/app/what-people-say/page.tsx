import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import WhatPeopleSayClient from './WhatPeopleSayClient'

export async function generateMetadata() {
  return resolveStaticMeta('Testimonials', '/what-people-say')
}

export default async function WhatPeopleSayPage() {
  const meta = await resolveStaticMeta('Testimonials', '/what-people-say')
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Testimonials', url: `${SITE_URL}/what-people-say` }
      ], { name: title, description })} />
      <main>
        <WhatPeopleSayClient />
      </main>
    </>
  )
}
