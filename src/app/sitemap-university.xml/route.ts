import { renderSitemapXml } from '@/lib/sitemap-xml'

export async function GET() {
  return renderSitemapXml('university')
}

