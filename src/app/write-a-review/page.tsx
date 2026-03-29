import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import WriteReviewClient from './WriteReviewClient'

export async function generateMetadata() {
  return resolveStaticMeta('Write a Review', '/write-a-review')
}

export default async function WriteReviewPage() {
  const meta = await resolveStaticMeta('Write a Review', '/write-a-review')
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Write a Review', url: `${SITE_URL}/write-a-review` }
      ], { name: title, description })} />
      <WriteReviewClient />
    </>
  )
}
