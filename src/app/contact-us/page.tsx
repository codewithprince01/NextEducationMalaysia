import { resolveStaticMeta } from '@/lib/seo/metadata'
import ContactUsClient from './ContactUsClient'

export async function generateMetadata() {
  return resolveStaticMeta('Contact Us', '/contact-us')
}

export default async function ContactUsPage() {
  return (
    <main>
      <ContactUsClient />
    </main>
  )
}
