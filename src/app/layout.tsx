import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import NavbarClient from '@/components/layout/NavbarClient'
import { globalBreadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo/structured-data'
import { resolveRouteHeadSchemas } from '@/lib/seo/route-head-schemas'

// Lazy-load below-fold / deferred components to reduce initial JS bundle.
// NOTE: In Next.js App Router, layout.tsx is a Server Component —
// dynamic() here creates separate JS chunks but ssr:false is not allowed.
const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => <footer style={{ minHeight: 480, background: '#f8fafc' }} aria-hidden />,
})
const FloatingActions = dynamic(() => import('@/components/ui/FloatingActions'))
const MalaysiaCallingAutoPopup = dynamic(() => import('@/components/layout/MalaysiaCallingAutoPopup'))

// Lazy-load ToastContainer + its CSS via wrapper — eliminates render-blocking CSS
const LazyToastContainer = dynamic(() => import('@/components/ui/ToastWrapper'))


export const metadata: Metadata = {
  title: 'Education Malaysia - Study in Malaysia',
  description: 'Find top universities, courses, and scholarships in Malaysia. Your complete guide to studying in Malaysia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.educationmalaysia.in'),
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/favicon.png?v=4',
    shortcut: '/favicon.png?v=4',
    apple: '/favicon.png?v=4',
  },
  openGraph: {
    type: 'website',
    siteName: 'Education Malaysia',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()
  const pathname =
    requestHeaders.get('x-pathname') ||
    requestHeaders.get('x-invoke-path') ||
    requestHeaders.get('next-url') ||
    '/'
  const breadcrumbSchema = globalBreadcrumbJsonLd(pathname)
  const routeSchemas = await resolveRouteHeadSchemas(pathname)

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WP578P4K'
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || 'p52lrj1wuu'
  const imageOrigin = process.env.NEXT_PUBLIC_IMAGE_CDN_URL || process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png?v=4" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=4" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png?v=4" />
        {/* 
          Static LCP preload — fires immediately on HTML parse, before RSC/React starts.
          girl-banner.webp is the default hero image (11KB WebP).
          If DB returns a different banner, the preload is harmless (browser discards it).
          Saves ~200-500ms on LCP by starting image fetch in parallel with JS evaluation.
        */}
        <link
          rel="preload"
          as="image"
          href="/girl-banner.webp"
          // @ts-expect-error — fetchpriority is valid HTML but not yet in React types
          fetchpriority="high"
        />
        <link rel="preconnect" href={imageOrigin} />
        <link rel="dns-prefetch" href={imageOrigin} />
        {/* YouTube thumbnail CDN — preconnect so the video poster loads fast */}
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        {/* Google Fonts preconnect for zero font-swap delay */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        {/* Global JSON-LD schemas — static site-wide, rendered inside <head> for all pages */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {breadcrumbSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        ) : null}
        {routeSchemas.map((schema, index) => (
          <script
            key={`route-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Script id="deferred-third-party-loader" strategy="lazyOnload">{`
          (function() {
            var thirdPartyLoaded = false;
            function loadThirdParty() {
              if (thirdPartyLoaded) return;
              thirdPartyLoaded = true;
              window.removeEventListener('scroll', loadThirdParty);
              window.removeEventListener('pointerdown', loadThirdParty);
              window.removeEventListener('touchstart', loadThirdParty);
              window.removeEventListener('keydown', loadThirdParty);

              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');

              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;
                t.src='https://www.clarity.ms/tag/' + i;
                y=l.getElementsByTagName(r)[0];
                y.parentNode.insertBefore(t,y);
              })(window,document,'clarity','script','${clarityId}');
            }

            window.addEventListener('scroll', loadThirdParty, {passive:true, once:true});
            window.addEventListener('pointerdown', loadThirdParty, {passive:true, once:true});
            window.addEventListener('touchstart', loadThirdParty, {passive:true, once:true});
            window.addEventListener('keydown', loadThirdParty, {passive:true, once:true});
            // GTM + Clarity load ONLY on user interaction — no idle/timeout fallback.
            // This prevents ~2.3s of main-thread blocking during passive page loads.
          })();
        `}</Script>
        <AuthProvider>
          <NavbarClient />
          {children}
          <FloatingActions />
          <MalaysiaCallingAutoPopup />
          <Footer />
          <LazyToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </body>
    </html>
  )
}
