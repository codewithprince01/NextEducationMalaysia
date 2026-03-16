'use client'

import { motion } from 'framer-motion'
import OtherFeatures from '@/components/common/OtherFeatures'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import { CheckCircle2 } from 'lucide-react'

const REASONS = [
  { title: "Affordable Education", desc: "Lower tuition fees and living costs compared to UK, USA, and Australia." },
  { title: "English Medium", desc: "Most universities use English as the primary medium of instruction." },
  { title: "Global Recognition", desc: "Degrees are globally recognized and highly valued by employers." },
  { title: "Modern Infrastructure", desc: "State-of-the-art facilities and research environments." },
  { title: "Strategic Location", desc: "Easy access to major Asian hubs and vibrant cultural exposure." },
  { title: "Part-time Work", desc: "Students can work part-time during semester breaks to support living." },
]

const COSTS = [
  { p: "Pre-university", d: "10 – 24 months", c: "$3,000 – $10,000" },
  { p: "Bachelor's Degree", d: "3 Years", c: "$10,000 – $20,000" },
  { p: "International Degree", d: "3-4 Years", c: "$40,000 – $100,000" },
  { p: "Medical Programme", d: "4-5 Years", c: "$30,000 – $100,000" },
  { p: "Post-Graduate", d: "1-2 Years", c: "$5,000 – $10,000" },
]

export default function WhyStudyClient() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="flex flex-col lg:grid lg:grid-cols-[2fr_1fr] gap-16">
          
          {/* Main Content */}
          <div className="space-y-20">
            {/* Header Section */}
            <header className="space-y-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black text-blue-950 tracking-tight leading-[1.1]"
              >
                Why Study in Malaysia for Higher Education?
              </motion.h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Malaysia is one of Asia&apos;s leading education hubs with global university campuses, affordable costs, and diverse culture. It is known for its infrastructure, safety, and English-medium instruction.
              </p>
            </header>

            {/* Reasons Section */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-blue-900 shrink-0">Top Reasons</h2>
                <div className="flex-1 h-px bg-blue-100"></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                {REASONS.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 group hover:-translate-y-2 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <h3 className="text-xl font-black text-blue-950 mb-3">{reason.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{reason.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Cost Table Section */}
            <section className="space-y-12">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-blue-900 shrink-0">Estimated Cost</h2>
                <div className="flex-1 h-px bg-blue-100"></div>
              </div>

              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="px-10 py-6 font-black uppercase tracking-widest text-xs">Programme</th>
                        <th className="px-10 py-6 font-black uppercase tracking-widest text-xs">Duration</th>
                        <th className="px-10 py-6 font-black uppercase tracking-widest text-xs text-right">Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {COSTS.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-10 py-6 font-black text-slate-900">{row.p}</td>
                          <td className="px-10 py-6 text-slate-500 font-bold">{row.d}</td>
                          <td className="px-10 py-6 text-right font-black text-blue-600 group-hover:scale-105 transition-transform">{row.c}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Culture & Global Units */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-blue-50 shadow-xl shadow-blue-900/5 space-y-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-blue-950">Culture & Connectivity</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Malaysia&apos;s multicultural society offers exposure to global perspectives and friendly communities. Strategically located for easy access to popular Asian destinations.
                </p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-blue-50 shadow-xl shadow-blue-900/5 space-y-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-blue-950">Top Global Universities</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  Institutions like UM, Monash, and Nottingham offer international degrees at a fraction of the cost compared to their home campuses.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            <OtherFeatures />
            <FeaturedUniversities variant="sidebar" />
          </aside>
        </div>
      </div>
    </div>
  )
}
