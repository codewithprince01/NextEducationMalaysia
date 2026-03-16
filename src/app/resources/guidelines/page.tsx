import Link from 'next/link'
import { GraduationCap, ShieldCheck, Users, ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Student Guidelines | Education Malaysia',
  description: 'Essential guidelines and information for international students studying in Malaysia, including immigration and quality standards.',
  alternates: { canonical: `${SITE_URL}/resources/guidelines` },
}

const guidelines = [
  { title: 'Graduate Pass', description: 'Learn about the Graduate Social Visit Pass which allows international students to stay in Malaysia for up to 12 months after graduation.', icon: GraduationCap, path: '/resources/guidelines/graduate-pass', delay: 100 },
  { title: 'MQA Standards', description: 'Understand the Malaysian Qualifications Agency (MQA) standards that ensure quality education across all higher learning institutions.', icon: ShieldCheck, path: '/resources/guidelines/MQA', delay: 200 },
  { title: 'Team Education Malaysia', description: 'Meet the dedicated team behind Education Malaysia who assist international students in their academic journey.', icon: Users, path: '/resources/guidelines/team-education-malaysia', delay: 300 },
]

export default function GuidelinesListingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b border-gray-50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-blue-50/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-6 uppercase tracking-wider">
              Student Information
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
              Essential <span className="text-blue-600">Guidelines</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Find all the official information you need regarding immigration rules, education standards, and support services to ensure a smooth academic experience in Malaysia.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guidelines.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-4xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-100">
                  <item.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8">{item.description}</p>
                <Link href={item.path} className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all group/btn">
                  Read Guidelines
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
