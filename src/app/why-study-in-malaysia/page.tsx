import Link from 'next/link'
import OtherFeatures from '@/components/common/OtherFeatures'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Why Study in Malaysia for Higher Education? | Education Malaysia',
  description: 'Discover why Malaysia is one of Asia\'s top study destinations — affordable tuition, English-medium universities, global recognition, and vibrant culture.',
  alternates: { canonical: `${SITE_URL}/why-study-in-malaysia` },
}

const reasons = [
  { title: 'Affordable Education', desc: 'Lower tuition fees and living costs compared to UK, USA, and Australia.' },
  { title: 'English Medium', desc: 'Most universities use English as the primary medium of instruction.' },
  { title: 'Global Recognition', desc: 'Degrees are globally recognized and highly valued by employers.' },
  { title: 'Modern Infrastructure', desc: 'State-of-the-art facilities and research environments.' },
  { title: 'Strategic Location', desc: 'Easy access to major Asian hubs and vibrant cultural exposure.' },
  { title: 'Part-time Work', desc: 'Students can work part-time during semester breaks to support living.' },
]

const costTable = [
  { p: 'Pre-university', d: '10 – 24 months', c: '$3,000 – $10,000' },
  { p: "Bachelor's Degree", d: '3 Years', c: '$10,000 – $20,000' },
  { p: 'International Degree', d: '3-4 Years', c: '$40,000 – $100,000' },
  { p: 'Medical Programme', d: '4-5 Years', c: '$30,000 – $100,000' },
  { p: 'Post-Graduate', d: '1-2 Years', c: '$5,000 – $10,000' },
]

export default function WhyStudyInMalaysiaPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Main Narrative */}
          <div className="lg:w-2/3 space-y-16">
            {/* Header Section */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight leading-tight">
                Why Study in Malaysia for Higher Education?
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Malaysia is one of Asia&apos;s leading education hubs with global university campuses, affordable costs, and diverse culture. It is known for its infrastructure, safety, and English-medium instruction, making it a premier study destination for international students.
              </p>
            </div>

            {/* Reasons Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-800 shrink-0">Top Reasons to Choose Malaysia</h2>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {reasons.map((reason, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 group">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">{reason.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{reason.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing Table Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-800 shrink-0">Estimated Cost of Study</h2>
                <div className="flex-1 h-px bg-blue-100" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-50 border-b border-blue-100 text-blue-900">
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Programme</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {costTable.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-800">{row.p}</td>
                          <td className="px-6 py-4 text-gray-600">{row.d}</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-600">{row.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Culture & Global Unis */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/50 border border-blue-100 p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Culture & Connectivity</h3>
                <p className="text-gray-700 text-sm leading-relaxed">Malaysia&apos;s multicultural society offers exposure to global perspectives and friendly communities. Strategically located for easy access to popular destinations like Bali and Seoul.</p>
              </div>
              <div className="bg-white/50 border border-blue-100 p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Top Global Universities</h3>
                <p className="text-gray-700 text-sm leading-relaxed">Institutions like UM, Monash, and Nottingham offer international degrees at a fraction of the cost compared to their home campuses.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebars */}
          <div className="lg:w-1/3 space-y-12">
            <div className="space-y-6"><OtherFeatures /></div>
            <div className="space-y-6"><FeaturedUniversities variant="sidebar" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
