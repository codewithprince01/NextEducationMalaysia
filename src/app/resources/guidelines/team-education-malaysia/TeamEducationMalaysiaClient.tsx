'use client'

import { CheckCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

type TeamContent = {
  heading?: string | null
  description?: string | null
  updated_at?: string | null
}

const formatHTML = (html: string) => {
  if (!html) return ''

  let decoded = html
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = html
    decoded = textarea.value
  }

  decoded = decoded.replace(/<span[^>]*>/gi, '')
  decoded = decoded.replace(/<\/span>/gi, '')
  decoded = decoded.replace(/style="[^"]*"/gi, '')
  decoded = decoded.replace(/&nbsp;/gi, ' ')
  decoded = decoded.replace(/<h([1-6])[^>]*>([^<]*?)\s*:\s*<\/h\1>/gi, (_m, level, title) => `<h${level}>${String(title).trim()}</h${level}>`)
  decoded = decoded.replace(/<p>\s*:\s*/gi, '<p>')
  decoded = decoded.replace(/<strong>(.*?)<\/strong>/gi, '<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>')
  decoded = decoded.replace(/<b>(.*?)<\/b>/gi, '<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>')
  decoded = decoded.replace(/(?:\r\n|\r|\n)/g, '</p><p>')
  decoded = `<p>${decoded}</p>`
  decoded = decoded.replace(/<p><\/p>/g, '')
  decoded = decoded.replace(/<input[^>]*type=["']checkbox["'][^>]*>/gi, '<span class="inline-block w-4 h-4 rounded border border-gray-400 mr-2 bg-white"></span>')

  decoded = decoded.replace(/<table(.*?)>/g, '<div class="responsive-table-wrapper"><table class="w-full border-collapse" $1>')
  decoded = decoded.replace(/<\/table>/g, '</table></div>')
  decoded = decoded.replace(/<thead>/g, '<thead class="bg-linear-to-r from-blue-500 to-blue-600 text-white text-left text-sm">')
  decoded = decoded.replace(/<th>/g, '<th class="px-4 py-3 font-medium whitespace-nowrap border-b border-blue-200 text-white text-sm">')
  decoded = decoded.replace(/<tr>/g, '<tr class="even:bg-blue-50">')
  decoded = decoded.replace(/<td>(.*?)<\/td>/g, '<td class="px-4 py-3 text-sm text-gray-800">$1</td>')
  decoded = decoded.replace(/<ul>/g, '<ul class="list-disc pl-6 space-y-2 text-gray-800">')
  decoded = decoded.replace(/<ol>/g, '<ol class="list-decimal pl-6 space-y-2 text-gray-800">')
  decoded = decoded.replace(/<li>/g, '<li class="mb-1">')

  return decoded
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

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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
            <div className="text-[15px] leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_p]:text-gray-800 [&_p]:mb-3 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700">
              <div className="custom-html" dangerouslySetInnerHTML={{ __html: formatHTML(description) }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
