import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/student/',
          '/login',
          '/signup',
          '/sign-up',
          '/migrate',
          '/optimize',
          '/password/reset',
          '/account/password/reset',
          '/confirmed-email',
          '/*?page=',
          '/*?program_id=',
          '/*?redirect=',
          '/*?_escaped_fragment_=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
