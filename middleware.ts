import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle MQA case-sensitive redirect to avoid 404/redirect loops
  if (pathname === '/resources/guidelines/MQA') {
    const url = request.nextUrl.clone()
    url.pathname = '/resources/guidelines/mqa'
    return NextResponse.redirect(url, 301)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}

