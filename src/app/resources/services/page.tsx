'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

// Metadata should be in a separate layout or handled via a server component wrapper if possible,
// but for now we follow the existing client component structure in this file.
// Note: Metadata export in 'use client' files is ignored by Next.js.
// We'll move it to a layout or page.tsx wrapper if needed, but since this file IS the page.tsx,
// and it has 'use client', we should probably split it.
// However, I will keep it as is for now and focus on UI fidelity.

const ServiceCardSkeleton = () => (
  <div className="bg-gray-50 rounded-2xl shadow-md p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
  </div>
)

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`)
        if (!response.ok) throw new Error('API failed')
        const json = await response.json()
        
        if (Array.isArray(json.data?.services)) {
          setServices(json.data.services)
        } else {
          // Fallback static list matching original intent
          setServices([
            { id: 1, page_name: "Discover Malaysia", uri: "discover-malaysia" },
            { id: 2, page_name: "Admission Guidance", uri: "admission-guidance" },
            { id: 3, page_name: "Visa & EMGS Guidance", uri: "visa-guidance" },
            { id: 4, page_name: "Arrival Support", uri: "arrival-support" },
            { id: 5, page_name: "Accommodation Assistance", uri: "accommodation-assistance" },
            { id: 6, page_name: "Translation Services", uri: "translation-services" },
            { id: 7, page_name: "Insurance Services", uri: "insurance-services" },
            { id: 8, page_name: "Pre-departure Briefing", uri: "pre-departure-briefing" }
          ])
        }
      } catch (error) {
        console.error("Error fetching services:", error)
        setServices([
          { id: 1, page_name: "Discover Malaysia", uri: "discover-malaysia" },
          { id: 2, page_name: "Admission Guidance", uri: "admission-guidance" },
          { id: 3, page_name: "Visa & EMGS Guidance", uri: "visa-guidance" },
          { id: 4, page_name: "Arrival Support", uri: "arrival-support" },
          { id: 5, page_name: "Accommodation Assistance", uri: "accommodation-assistance" },
          { id: 6, page_name: "Translation Services", uri: "translation-services" },
          { id: 7, page_name: "Insurance Services", uri: "insurance-services" },
          { id: 8, page_name: "Pre-departure Briefing", uri: "pre-departure-briefing" }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Services' }
      ]} />
      
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-3">
            <span className="text-blue-600">What We Do</span>
          </h2>
          <p className="text-gray-700 text-center mb-10 max-w-3xl mx-auto">
            Having and managing a correct marketing strategy is crucial in a fast-moving market.
          </p>

          {/* Services Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [...Array(8)].map((_, i) => <ServiceCardSkeleton key={i} />)
              : services.map((item) => (
                  <Link
                    key={item.id}
                    href={`/resources/services/${item.uri}`}
                    className="bg-gray-50 rounded-2xl shadow-md p-5 group hover:shadow-xl hover:-translate-y-1 transition duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center text-xl">
                        <Sparkles size={20} />
                      </div>
                      <ArrowRight className="text-orange-500 group-hover:text-blue-600 transition" size={20} />
                    </div>
                    <h3 className="text-gray-800 font-semibold text-base truncate group-hover:text-blue-600 transition">
                      {item.page_name}
                    </h3>
                  </Link>
                ))}
          </div>
        </div>
      </section>
    </div>
  )
}
