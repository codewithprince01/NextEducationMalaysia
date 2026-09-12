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

    // Course-listing filters. Each combination is a view of a page that already
    // exists — /university/<slug>/courses — and the canonical on them says so,
    // but there are far more combinations than real pages and crawling them all
    // spends the budget that should reach the course pages themselves. Both the
    // `?` and `&` forms are listed because a robots pattern matches literally:
    // `/*?course_category_id=` alone would miss the parameter whenever it is not
    // the first one in the query string.
    //
    // Only ever matches URLs carrying a query string, so the canonical course
    // and listing URLs — which have none — stay fully crawlable.
    '/*?specialization_id=',
    '/*&specialization_id=',
    '/*?course_category_id=',
    '/*&course_category_id=',
    '/*?study_mode=',
    '/*&study_mode=',
    '/*?level=',
    '/*&level=',
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
