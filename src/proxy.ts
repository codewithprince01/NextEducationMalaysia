/**
 * Edge Middleware
 *
 * Handles URL redirects, noindex enforcement, and invalid URL blocking.
 * Runs at the edge before any page rendering.
 */
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Force canonical host: educationmalaysia.in -> www.educationmalaysia.in
  // Keeps path/query/hash intact and applies to all non-local environments.
  const host = request.nextUrl.hostname.toLowerCase();
  if (host === 'educationmalaysia.in') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.educationmalaysia.in';
    return NextResponse.redirect(url, 308);
  }

  // Legacy Guidelines URL normalization (old project compatibility)
  if (
    pathname.startsWith("/resources/Guidelines") ||
    pathname.startsWith("/resources/guidelines/MQA")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname
      .replace("/resources/Guidelines", "/resources/guidelines")
      .replace("/resources/guidelines/MQA", "/resources/guidelines/mqa");
    return NextResponse.rewrite(url);
  }

  // Block ?page= query parameter — use /page-N format instead
  if (searchParams.has("page")) {
    const url = request.nextUrl.clone();
    url.pathname = "/not-found";
    return NextResponse.rewrite(url);
  }

  // Block #! hashbang URLs (Google legacy AJAX crawling artifact)
  const hash = request.headers.get("x-hash") || "";
  if (hash === "#!" || hash.startsWith("#!")) {
    const url = request.nextUrl.clone();
    url.pathname = "/not-found";
    return NextResponse.rewrite(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-full-path", `${pathname}${request.nextUrl.search || ""}`);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
