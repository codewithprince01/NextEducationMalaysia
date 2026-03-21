import type { Metadata } from 'next'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/context/AuthContext'
import { ToastContainer } from 'react-toastify';
import NavbarClient from '@/components/layout/NavbarClient'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Education Malaysia - Study in Malaysia',
  description: 'Find top universities, courses, and scholarships in Malaysia. Your complete guide to studying in Malaysia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.educationmalaysia.in'),
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <NavbarClient />
          {children}
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </body>
    </html>
  )
}
