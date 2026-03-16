import { resolveStaticMeta } from '@/lib/seo/metadata'
import { faqJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { getFaqs } from '@/lib/queries/home'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import FaqsClient from './FaqsClient'

export async function generateMetadata() {
  return resolveStaticMeta('FAQ', '/faqs')
}

export default async function FaqsPage() {
  const faqs = await getFaqs()
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'FAQs', url: `${SITE_URL}/faqs` }
      ])} />
      <main>
        <FaqsClient />
      </main>
    </>
  )
}
