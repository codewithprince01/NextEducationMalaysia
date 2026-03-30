import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/AuthContext'
import { ToastContainer } from 'react-toastify';
import NavbarClient from '@/components/layout/NavbarClient'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import MalaysiaCallingAutoPopup from '@/components/layout/MalaysiaCallingAutoPopup'

export const metadata: Metadata = {
  title: 'Education Malaysia - Study in Malaysia',
  description: 'Find top universities, courses, and scholarships in Malaysia. Your complete guide to studying in Malaysia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.educationmalaysia.in'),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WP578P4K'
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || 'p52lrj1wuu'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png?v=4" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=4" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png?v=4" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
      </head>
      <body className="font-sans antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Script id="deferred-third-party-loader" strategy="afterInteractive">{`
          (function() {
            var thirdPartyLoaded = false;
            function loadThirdParty() {
              if (thirdPartyLoaded) return;
              thirdPartyLoaded = true;
              window.removeEventListener('scroll', loadThirdParty);
              window.removeEventListener('mousedown', loadThirdParty);
              window.removeEventListener('mousemove', loadThirdParty);
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
            window.addEventListener('mousedown', loadThirdParty, {passive:true, once:true});
            window.addEventListener('mousemove', loadThirdParty, {passive:true, once:true});
            window.addEventListener('touchstart', loadThirdParty, {passive:true, once:true});
            window.addEventListener('keydown', loadThirdParty, {passive:true, once:true});
            setTimeout(loadThirdParty, 10000);
          })();
        `}</Script>
        <AuthProvider>
          <NavbarClient />
          {children}
          <FloatingActions />
          <MalaysiaCallingAutoPopup />
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </body>
    </html>
  )
}
