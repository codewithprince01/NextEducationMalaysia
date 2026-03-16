'use client'

import React, { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import Breadcrumb from '@/components/Breadcrumb'

// ✅ Replicating the formatting function from TeamEducationMalaysia.jsx
const formatHTML = (html: string) => {
  if (!html) return ""
  
  let decoded = html
  
  decoded = decoded.replace(/<span[^>]*>/gi, "")
  decoded = decoded.replace(/<\/span>/gi, "")
  decoded = decoded.replace(/style="[^"]*"/gi, "")
  decoded = decoded.replace(/&nbsp;/gi, " ")
  decoded = decoded.replace(
    /<h([1-6])[^>]*>([^<]*?)\s*:\s*<\/h\1>/gi,
    (_m, level, title) => `<h${level}>${title.trim()}</h${level}>`
  )
  decoded = decoded.replace(/<p>\s*:\s*/gi, "<p>")
  decoded = decoded.replace(
    /<strong>(.*?)<\/strong>/gi,
    `<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>`
  )
  decoded = decoded.replace(
    /<b>(.*?)<\/b>/gi,
    `<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>`
  )
  
  decoded = decoded.replace(/<table(.*?)>/g, `<div class="responsive-table-wrapper"><table class="w-full border-collapse" $1>`)
  decoded = decoded.replace(/<\/table>/g, "</table></div>")
  decoded = decoded.replace(/<thead>/g, '<thead class="bg-linear-to-r from-blue-500 to-blue-600 text-white text-left text-sm">')
  decoded = decoded.replace(/<th>/g, '<th class="px-4 py-3 font-medium whitespace-nowrap border-b border-blue-200 text-white text-sm">')
  decoded = decoded.replace(/<tr>/g, '<tr class="even:bg-blue-50">')
  decoded = decoded.replace(/<td>(.*?)<\/td>/g, '<td class="px-4 py-3 text-sm text-gray-800">$1</td>')
  
  decoded = decoded.replace(/<ul>/g, '<ul class="list-disc pl-6 space-y-2 text-gray-800">')
  decoded = decoded.replace(/<ol>/g, '<ol class="list-decimal pl-6 space-y-2 text-gray-800">')
  decoded = decoded.replace(/<li>/g, '<li class="mb-1">')
  
  return decoded
}

export default function TeamEducationMalaysiaPage() {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('https://www.educationmalaysia.in/api/home')
        if (!response.ok) throw new Error('API failed')
        const json = await response.json()
        const pageContent = json?.data?.pageContent
        if (pageContent) {
          setContent(pageContent)
        } else {
          // Fallback static data
          setContent({
            heading: "Our Dedicated Team",
            description: `
              <strong>Our Mission</strong>
              <p>To provide international students with the most comprehensive support for their academic journey in Malaysia.</p>
              <strong>Core Team</strong>
              <ul>
                <li>Counseling Experts</li>
                <li>Visa Specialists</li>
                <li>Arrival Coordinators</li>
                <li>Academic Advisors</li>
              </ul>
            `
          })
        }
      } catch (err) {
        console.error("Failed to load page content:", err)
        setContent({
          heading: "Our Dedicated Team",
          description: `
            <strong>Our Mission</strong>
            <p>To provide international students with the most comprehensive support for their academic journey in Malaysia.</p>
            <strong>Core Team</strong>
            <ul>
              <li>Counseling Experts</li>
              <li>Visa Specialists</li>
              <li>Arrival Coordinators</li>
              <li>Academic Advisors</li>
            </ul>
          `
        })
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="w-full bg-white">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Guidelines', href: '/resources/guidelines' },
        { label: 'Team Education Malaysia' }
      ]} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          {/* Header section matching original design */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Team Education Malaysia
              </h2>
              <p className="text-sm text-gray-600">Updated on - Mar 26, 2025</p>
            </div>
          </div>

          {/* Dynamic Content */}
          {content && (
            <div className="animate-fadeIn">
              {content.heading && (
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {content.heading}
                </h1>
              )}

              {content.description && (
                <div className="text-[15px] leading-relaxed">
                  <div
                    className="custom-html"
                    dangerouslySetInnerHTML={{
                      __html: formatHTML(content.description),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {!loading && !content && (
            <p className="text-center py-10 text-red-500">No content found</p>
          )}
        </div>
      </div>
    </div>
  )
}
