import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  const disallowRules = [
    '/admin',
    '/admin/',
    '/student/',
    '/login',
    '/signup',
    '/signup/',
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
  ]

  const googlebotAllowRules = [
    '/',
    '/_next/static/',
    '/_next/image/',
    '/api/v1/',
    '/api/courses/level/',
  ]

  const googlebotDisallowRules = [
    ...disallowRules,
    '/api/v1/student/',
    '/api/v1/inquiry/',
    '/api/v1/add-review',
    '/api/v1/contact-form',
    '/api/send-mail',
  ]

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: googlebotAllowRules,
        disallow: googlebotDisallowRules,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/api/', '/api/v1/', ...disallowRules],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
