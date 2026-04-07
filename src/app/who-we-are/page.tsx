import { resolveStaticMeta } from '@/lib/seo/metadata'
import WhoWeAreClient from './WhoWeAreClient'

export async function generateMetadata() {
  return resolveStaticMeta('Who We Are', '/who-we-are')
}

export default async function WhoWeArePage() {
  return (
    <main>
      <WhoWeAreClient />
    </main>
  )
}
