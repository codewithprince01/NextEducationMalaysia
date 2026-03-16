import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Why Study in Malaysia? Top Reasons for International Students',
  description: 'Discover why Malaysia is a top study destination: affordable fees, English-medium universities, globally recognized degrees, and vibrant culture.',
  alternates: { canonical: `${SITE_URL}/why-study` },
}

const REASONS = [
  { title: "Affordable Education", desc: "Lower tuition fees and living costs compared to UK, USA, and Australia." },
  { title: "English Medium", desc: "Most universities use English as the primary medium of instruction." },
  { title: "Global Recognition", desc: "Degrees are globally recognized and highly valued by employers." },
  { title: "Modern Infrastructure", desc: "State-of-the-art facilities and research environments." },
  { title: "Strategic Location", desc: "Easy access to major Asian hubs and vibrant cultural exposure." },
  { title: "Part-time Work", desc: "Students can work part-time during semester breaks to support living." },
]

const COST_TABLE = [
  { p: "Pre-university", d: "10 – 24 months", c: "$3,000 – $10,000" },
  { p: "Bachelor's Degree", d: "3 Years", c: "$10,000 – $20,000" },
  { p: "International Degree", d: "3-4 Years", c: "$40,000 – $100,000" },
  { p: "Medical Programme", d: "4-5 Years", c: "$30,000 – $100,000" },
  { p: "Post-Graduate", d: "1-2 Years", c: "$5,000 – $10,000" },
]

export default function WhyStudyPage() {
  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            Education Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Why Study in Malaysia?
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Malaysia is one of Asia's leading education hubs with global university campuses, affordable costs, and diverse culture.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-20 space-y-24">
        {/* Reasons Grid */}
        <div className="space-y-12">
          <h2 className="text-3xl font-black text-center text-gray-900">Top Reasons to Choose Malaysia</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {REASONS.map((reason, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 font-black text-blue-600 text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-500 leading-relaxed">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Table */}
        <div className="space-y-10">
          <h2 className="text-3xl font-black text-center text-gray-900">Estimated Cost of Study</h2>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-8 py-5 font-black uppercase tracking-widest text-sm">Programme</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest text-sm">Duration</th>
                    <th className="px-8 py-5 font-black uppercase tracking-widest text-sm text-right">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {COST_TABLE.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-gray-900">{row.p}</td>
                      <td className="px-8 py-5 text-gray-500">{row.d}</td>
                      <td className="px-8 py-5 text-right font-black text-blue-600">{row.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Culture & Global Unis */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-2xl font-black text-blue-800 mb-4">Culture & Connectivity</h3>
            <p className="text-gray-600 leading-relaxed">Malaysia's multicultural society offers exposure to global perspectives and friendly communities. Strategically located for easy access to popular destinations like Bali and Seoul.</p>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-900/5">
            <h3 className="text-2xl font-black text-blue-800 mb-4">Top Global Universities</h3>
            <p className="text-gray-600 leading-relaxed">Institutions like UM, Monash, and Nottingham offer international degrees at a fraction of the cost compared to their home campuses.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 to-slate-900/80" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4">Ready to Start Your Journey?</h3>
            <p className="text-slate-300 mb-8 text-lg">Connect with our expert counselors for a free consultation today.</p>
            <Link href="/contact-us" className="inline-block bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors">
              Get Free Counseling
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
