import { resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export async function generateMetadata() {
  return resolveStaticMeta('Privacy Policy', '/privacy-policy')
}

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      points: [
        'Personal details like name, email, phone number, and academic preferences when you submit inquiry forms.',
        'Technical data such as browser type, pages visited, and session analytics to improve website performance.',
        'Communication data when you contact us through forms, email, or WhatsApp.',
      ],
    },
    {
      title: '2. How We Use Your Data',
      points: [
        'To provide counseling support, course guidance, and admission assistance.',
        'To respond to your requests for brochures, fee structures, and consultation sessions.',
        'To improve user experience, content quality, and service delivery.',
      ],
    },
    {
      title: '3. Data Sharing',
      points: [
        'We do not sell your personal information.',
        'Information may be shared only with authorized university/admission partners to process your request.',
        'Data may also be shared with service providers for email delivery and platform operations under confidentiality.',
      ],
    },
    {
      title: '4. Cookies & Tracking',
      points: [
        'We use cookies to remember preferences and analyze website traffic.',
        'You can disable cookies in browser settings, though some features may be affected.',
      ],
    },
    {
      title: '5. Data Security',
      points: [
        'We implement practical administrative and technical safeguards.',
        'No system is 100% secure, but we continuously monitor and improve our protection measures.',
      ],
    },
    {
      title: '6. Your Rights',
      points: [
        'You may request correction, update, or deletion of your personal data.',
        'You can contact us any time for privacy-related queries.',
      ],
    },
    {
      title: '7. Policy Updates',
      points: [
        'This Privacy Policy may be updated periodically.',
        'Latest updates will be reflected on this page.',
      ],
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Privacy Policy', url: `${SITE_URL}/privacy-policy` }
      ])} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Privacy Policy' },
      ]} />

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="rounded-3xl border border-blue-100 bg-white shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-blue-700 to-blue-600 text-white px-6 py-10 sm:px-10">
              <p className="text-blue-100 text-sm font-medium mb-2">Last updated: March 2026</p>
              <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
              <p className="text-blue-100 mt-4 max-w-3xl">
                This policy explains how Education Malaysia collects, uses, and protects your personal information when you use our platform.
              </p>
            </div>

            <div className="p-6 sm:p-10 space-y-6">
              {sections.map((section) => (
                <section key={section.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                  <ul className="space-y-2 text-gray-700 text-[15px] leading-relaxed">
                    {section.points.map((point, idx) => (
                      <li key={`${section.title}-${idx}`} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  For any privacy concerns, please contact us at{' '}
                  <a href="mailto:info@educationmalaysia.in" className="text-blue-700 underline">info@educationmalaysia.in</a>.
                </p>
                <p className="text-gray-700 text-[15px] mt-2">
                  You may also review our{' '}
                  <Link href="/terms-and-conditions" className="text-blue-700 underline">Terms & Conditions</Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
