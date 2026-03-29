import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export async function generateMetadata() {
  return resolveStaticMeta('Terms and Conditions', '/terms-and-conditions')
}

export default async function TermsPage() {
  const meta = await resolveStaticMeta('Terms and Conditions', '/terms-and-conditions')
  const { title, description } = extractMetadataText(meta)

  const sections = [
    {
      title: '1. Acceptance of Terms',
      points: [
        'By using this website, you agree to these Terms & Conditions.',
        'If you do not agree with any part, please discontinue use of the platform.',
      ],
    },
    {
      title: '2. Services Scope',
      points: [
        'Education Malaysia provides counseling guidance, admission support, and related informational services.',
        'Final admission decisions are made by universities and official authorities.',
      ],
    },
    {
      title: '3. User Responsibilities',
      points: [
        'You must provide accurate information while submitting forms.',
        'You must not misuse, duplicate, or attempt unauthorized access to platform systems.',
        'You are responsible for maintaining the confidentiality of your login credentials.',
      ],
    },
    {
      title: '4. Intellectual Property',
      points: [
        'All branding, content, layout, and assets on this website are protected.',
        'Unauthorized reuse, redistribution, or commercial copying is prohibited without written approval.',
      ],
    },
    {
      title: '5. Third-Party Links',
      points: [
        'Our website may include links to external websites for user convenience.',
        'We are not responsible for content, privacy, or practices of external sites.',
      ],
    },
    {
      title: '6. Limitation of Liability',
      points: [
        'We strive for accurate and updated information, but do not guarantee absolute completeness.',
        'Education Malaysia shall not be liable for indirect losses arising from website usage.',
      ],
    },
    {
      title: '7. Changes to Terms',
      points: [
        'We may revise these Terms & Conditions at any time.',
        'Updated terms become effective once published on this page.',
      ],
    },
    {
      title: '8. Governing Law',
      points: [
        'These terms are governed by applicable laws and regulations.',
        'Any disputes shall be handled by competent jurisdiction as per law.',
      ],
    },
  ]

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Terms and Conditions', url: `${SITE_URL}/terms-and-conditions` }
      ], { name: title, description })} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Terms & Conditions' },
      ]} />

      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="rounded-3xl border border-blue-100 bg-white shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-blue-700 to-blue-600 text-white px-6 py-10 sm:px-10">
              <p className="text-blue-100 text-sm font-medium mb-2">Last updated: March 2026</p>
              <h1 className="text-3xl sm:text-4xl font-bold">Terms &amp; Conditions</h1>
              <p className="text-blue-100 mt-4 max-w-3xl">
                Please read these terms carefully before using Education Malaysia services and platform features.
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Related Policy</h2>
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  Please also review our{' '}
                  <Link href="/privacy-policy" className="text-blue-700 underline">Privacy Policy</Link>{' '}
                  for details on data handling and user privacy.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
