import { resolveStaticMeta } from '@/lib/seo/metadata'
import WriteReviewClient from './WriteReviewClient'

export async function generateMetadata() {
  return resolveStaticMeta('Write a Review', '/write-a-review')
}

export default async function WriteReviewPage() {
  return <WriteReviewClient />
}
