import { resolveStaticMeta } from '@/lib/seo/metadata'
import WhatPeopleSayClient from './WhatPeopleSayClient'

export async function generateMetadata() {
  return resolveStaticMeta('Testimonials', '/what-people-say')
}

export default async function WhatPeopleSayPage() {
  return (
    <main>
      <WhatPeopleSayClient />
    </main>
  )
}
