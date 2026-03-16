import { resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import ContactUsClient from './ContactUsClient'

export async function generateMetadata() {
  return resolveStaticMeta('Contact Us', '/contact-us')
}

export default function ContactUsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Contact Us', url: `${SITE_URL}/contact-us` }
      ])} />
      <main>
        <ContactUsClient />
      </main>
    </>
  )
}
