/**
 * Edge Middleware
 *
 * Handles URL redirects, noindex enforcement, and invalid URL blocking.
 * Runs at the edge before any page rendering.
 */
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  return NextResponse.next();
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
