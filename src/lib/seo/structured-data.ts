import { SITE_URL, storageUrl } from '@/lib/constants'

type JsonLd = Record<string, unknown>

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Education Malaysia',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://www.facebook.com/educationmalaysia.in',
      'https://www.instagram.com/educationmalaysia.in/',
      'https://www.linkedin.com/company/educationmalaysia/',
      'https://www.youtube.com/@educationmalaysia6986',
      'https://twitter.com/educatemalaysia/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98185-60331',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  }
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Education Malaysia',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/universities?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function universityJsonLd(uni: {
  name?: string | null
  uname?: string | null
  logo_path?: string | null
  city?: string | null
  state?: string | null
  rating?: string | number | null
  established_year?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: uni.name,
    url: `${SITE_URL}/university/${uni.uname}`,
    logo: storageUrl(uni.logo_path) || undefined,
    foundingDate: uni.established_year || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: uni.city,
      addressRegion: uni.state,
      addressCountry: 'MY',
    },
    ...(uni.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: uni.rating,
            bestRating: '5',
          },
        }
      : {}),
  }
}

export function courseJsonLd(program: {
  course_name?: string | null
  slug?: string | null
  meta_description?: string | null
}, universityName: string, universitySlug: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.course_name,
    description: program.meta_description || program.course_name,
    url: `${SITE_URL}/university/${universitySlug}/courses/${program.slug}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: universityName,
    },
  }
}

export function blogJsonLd(blog: {
  title?: string | null
  headline?: string | null
  slug?: string | null
  short_description?: string | null
  description?: string | null
  thumbnail_path?: string | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
  author?: { name?: string | null } | null
  category?: { category_slug?: string | null } | null
}, blogId: number): JsonLd {
  const categorySlug = blog.category?.category_slug || 'uncategorized'
  const toIso = (value?: Date | string | null) => {
    if (!value) return undefined
    if (value instanceof Date) return value.toISOString()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title || blog.headline,
    description: blog.short_description || blog.description,
    image: storageUrl(blog.thumbnail_path) || undefined,
    url: `${SITE_URL}/blog/${categorySlug}/${blog.slug}-${blogId}`,
    datePublished: toIso(blog.created_at),
    dateModified: toIso(blog.updated_at),
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'Education Malaysia',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Education Malaysia',
      url: SITE_URL,
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqJsonLd(faqs: { question?: string | null; answer?: string | null }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs
      .filter(f => f.question && f.answer)
      .map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
  }
}

export function specializationJsonLd(spec: {
  name?: string | null
  slug?: string | null
  description?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Topic',
    name: spec.name,
    description: spec.description || undefined,
    url: `${SITE_URL}/specialization/${spec.slug}`,
  }
}

export function scholarshipJsonLd(scholarship: {
  title?: string | null
  slug?: string | null
  description?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Grant',
    name: scholarship.title,
    description: stripTags(scholarship.description || '').substring(0, 200),
    url: `${SITE_URL}/scholarships/${scholarship.slug}`,
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
}
