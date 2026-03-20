import React from 'react'
import Link from 'next/link'
import { getAllScholarships } from '@/lib/queries/scholarships'
import ScholarshipsListingClient from './ScholarshipsListingClient'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Scholarships for International Students - Education Malaysia',
  description: 'Explore verified scholarship opportunities for international students in Malaysia. Find merit-based, need-based, and university-specific grants.',
  alternates: { canonical: `${SITE_URL}/scholarships` },
}

export default async function ScholarshipsPage() {
  const scholarshipsData = await getAllScholarships()
  const scholarships = serializeBigInt(scholarshipsData)

  return (
    <>
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500 font-medium">Scholarships</span>
            </li>
          </ol>
        </div>
      </nav>

      <section className="relative px-4 md:px-10 py-20 bg-gray-100 min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-10 -mt-10">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Study{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Abroad Scholarships
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover amazing scholarship opportunities with{' '}
              <span className="font-semibold text-blue-600">
                Education Malaysia
              </span>
            </p>
            <div className="mt-8 flex justify-center">
              <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>
          </div>

          <ScholarshipsListingClient scholarships={scholarships as any[]} />
        </div>
      </section>
    </>
  )
}
