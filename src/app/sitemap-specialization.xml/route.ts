import { renderSitemapXml } from '@/lib/sitemap-xml'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return renderSitemapXml('specialization')
}
