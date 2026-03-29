import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import WhoWeAreClient from './WhoWeAreClient'

export async function generateMetadata() {
  return resolveStaticMeta('Who We Are', '/who-we-are')
}

export default async function WhoWeArePage() {
  const meta = await resolveStaticMeta('Who We Are', '/who-we-are')
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Who We Are', url: `${SITE_URL}/who-we-are` }
      ], { name: title, description })} />
      <main>
        <WhoWeAreClient />
      </main>
    </>
  )
}
