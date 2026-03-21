import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import BlogListClient from './BlogListClient'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 21600 // 6 hours

export async function generateMetadata() {
  return resolveStaticMetaAny(['blog', 'Blog'], '/blog', 'Blog - Education Malaysia')
}

import { blogService } from '@/backend'

export default async function BlogListPage() {
  const result = await blogService.getBlogs(1, 12)
  
  return <BlogListClient initialData={result} />
}
