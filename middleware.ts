import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/** Client-readable hint dropped next to the httpOnly refresh cookie on sign-in. */
const SESSION_HINT_COOKIE = 'em_session'

/** Pages that only make sense signed out. */
const GUEST_ONLY_ROUTES = ['/login', '/signup']

/** Everything below this prefix needs a session. */
const PROTECTED_PREFIX = '/student'

const DEFAULT_AUTHENTICATED_ROUTE = '/student/overview'

function sanitizeRedirect(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  if (value.startsWith('/login') || value.startsWith('/signup')) return null
  return value
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle MQA case-sensitive redirect to avoid 404/redirect loops
  if (pathname === '/resources/guidelines/MQA') {
    const url = request.nextUrl.clone()
    url.pathname = '/resources/guidelines/mqa'
    return NextResponse.redirect(url, 301)
  }

  // The hint only decides *routing*. Authorization still happens in the API
  // routes against the JWT, so a forged hint gains nothing.
  const hasSession = request.cookies.get(SESSION_HINT_COOKIE)?.value === '1'

  // /signup/apply/... is a guided apply flow that works for signed-in students too,
  // so only the bare auth pages are guest-only.
  const isGuestOnly = GUEST_ONLY_ROUTES.includes(pathname)

  if (hasSession && isGuestOnly) {
    const next = sanitizeRedirect(request.nextUrl.searchParams.get('next'))
    const target = new URL(next || DEFAULT_AUTHENTICATED_ROUTE, request.nextUrl.origin)
    const url = request.nextUrl.clone()
    url.pathname = target.pathname
    url.search = target.search
    return NextResponse.redirect(url)
  }

  if (!hasSession && (pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(`${pathname}${request.nextUrl.search}`)}`
    return NextResponse.redirect(url)
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
