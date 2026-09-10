'use client'

import { CheckCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { formatRichText } from '@/lib/richText'

type TeamContent = {
  heading?: string | null
  description?: string | null
  updated_at?: string | null
}

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) return 'Mar 26, 2025'
  const d = new Date(updatedAt)
  if (Number.isNaN(d.getTime())) return 'Mar 26, 2025'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function TeamEducationMalaysiaClient({ initialContent }: { initialContent: TeamContent | null }) {
  const heading =
    initialContent?.heading || 'Study in Malaysia: Discover Universities, Expenses, Programs, Visa, Admission Criteria, Scholarships'
  const description =
    initialContent?.description ||
    '<p>To provide international students with the most comprehensive support for their academic journey in Malaysia.</p>'

  return (
    <div className="w-full bg-white">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: 'Guidelines', href: '/resources/guidelines' },
          { label: 'Team Education Malaysia' },
        ]}
      />

      <div className="site-container py-6">
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Team Education Malaysia</h2>
              <p className="text-sm text-gray-600">Updated on - {formatUpdatedAt(initialContent?.updated_at)}</p>
            </div>
          </div>

          <div className="animate-fadeIn">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{heading}</h1>
            <div
              className="custom-html cms-content"
              dangerouslySetInnerHTML={{ __html: formatRichText(description) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
