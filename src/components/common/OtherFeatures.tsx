'use client'

import Link from 'next/link'
import { Lightbulb, ChevronRight } from 'lucide-react'

const OTHER_SERVICES = [
  "Pre Departure Support",
  "Visa Guidance",
  "MOHE Guide to Malaysia’s Higher Education",
  "Why Study In Malaysia?",
  "Plan Your Budget",
  "Jobs and Career",
  "Discover Malaysia",
  "Admission Guidance",
  "Application and Visa Guidance",
  "Research Proposal For PhD",
  "Top Reasons to study in Malaysia",
  "MUET Online Coaching",
]

const toSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[?’]/g, "")

export default function OtherFeatures() {
  return (
    <div className="bg-white shadow-2xl shadow-blue-900/5 rounded-[2rem] p-8 border border-gray-100">
      <h4 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-5 mb-6 flex items-center gap-3">
        <Lightbulb className="text-orange-500 w-5 h-5" />
        Other Services
      </h4>

      <ul className="space-y-2">
        {OTHER_SERVICES.map((service, index) => (
          <li key={index}>
            <Link
              href={`/resources/services/${toSlug(service)}`}
              className="flex items-start justify-between px-4 py-3 rounded-2xl text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition-all group"
            >
              <div className="flex items-start gap-3 w-full">
                <Lightbulb className="text-orange-400 mt-1 shrink-0 w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm text-left leading-relaxed group-hover:translate-x-1 transition-transform">
                  {service}
                </span>
              </div>
              <ChevronRight className="text-orange-500 mt-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all w-4 h-4" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="text-center pt-6 border-t border-gray-100 mt-6">
        <Link
          href="/resources/services"
          className="text-xs font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          View All Services →
        </Link>
      </div>
    </div>
  )
}
