import type { Metadata } from 'next'
import { IMAGE_BASE_URL, SITE_URL, storageUrl } from '@/lib/constants'

type DiscoverySeo = {
  meta_title?: string | null
  meta_description?: string | null
  meta_keyword?: string | null
  og_image_path?: string | null
}

function normalizeOgImage(input?: string | null): string {
  if (!input) return `${SITE_URL}/og-default.png`
  const value = String(input).trim()
  if (!value) return `${SITE_URL}/og-default.png`
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/storage/')) return `${IMAGE_BASE_URL}${value}`
  if (value.startsWith('/')) return `${SITE_URL}${value}`
  if (value.startsWith('storage/')) return `${IMAGE_BASE_URL}/${value}`
  return storageUrl(value) || `${SITE_URL}/og-default.png`
}

export function buildCoursesDiscoveryMetadata(params: {
  seo?: DiscoverySeo | null
  fallbackTitle: string
  fallbackDescription: string
  canonicalPath: string
}): Metadata {
  const { seo, fallbackTitle, fallbackDescription, canonicalPath } = params
  const title = seo?.meta_title?.trim() || fallbackTitle
  const description = seo?.meta_description?.trim() || fallbackDescription
  const keywords = seo?.meta_keyword?.trim() || undefined
  const canonical = `${SITE_URL}${canonicalPath}`
  const ogImage = normalizeOgImage(seo?.og_image_path)

  return {
    title: { absolute: title },
    description,
    keywords,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: 'Education Malaysia',
      locale: 'en_US',
      title,
      description,
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@educatemalaysia',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'server-rendered-meta': 'true',
    },
  }
}

