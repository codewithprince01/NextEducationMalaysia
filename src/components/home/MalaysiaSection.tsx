'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Play, GraduationCap, Globe2, Shield, Users, Briefcase,
  DollarSign, BookOpen, School, Building2, Award,
} from 'lucide-react'

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) { setCount(value); clearInterval(timer) }
            else setCount(current)
          }, 2000 / steps)
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  const fmt = (n: number) => {
    if (value >= 1000) return Math.floor(n).toLocaleString()
    if (value < 10) return n.toFixed(1)
    return Math.floor(n).toString()
  }

  return (
    <div ref={ref} className="text-2xl md:text-3xl font-bold text-[#003893]">
      {prefix}{fmt(count)}{suffix}
    </div>
  )
}

// ── Stats data ─────────────────────────────────────────────────────────────────
const stats = [
  { icon: GraduationCap, value: 100, suffix: '+', label: 'Accredited Universities and University Colleges' },
  { icon: Users, value: 130, suffix: 'K+', label: 'International Students' },
  { icon: DollarSign, value: 470, suffix: 'B+ USD', prefix: '$', label: 'GDP Economy' },
  { icon: Award, value: 97, suffix: '%', label: 'Study Visa Success Rate' },
  { icon: Briefcase, value: 70, suffix: '%', label: 'Employment To Population Ratio' },
]

// ── Education stages ───────────────────────────────────────────────────────────
const stages = [
  { title: 'Early Education', icon: BookOpen, items: ['Government', 'Private', 'Special Needs', 'Assistance'] },
  { title: 'Primary Education', icon: School, items: ['Government', 'Religious', 'Private', 'Special Needs', 'Examinations & Assessments', 'School Transfer', 'Assistance'] },
  { title: 'Secondary Education', icon: Building2, items: ['Government', 'Vocational College', 'Private', 'Special Needs', 'Examinations & Assessments', 'Assistance'] },
  { title: 'Post Secondary', icon: Award, items: ['Form 6', 'Matriculation', 'Examinations', 'Assistance'] },
  {
    title: 'Higher Education', icon: GraduationCap,
    sections: [
      { title: 'Citizen', items: ['Local IPTA', 'Local IPTS', 'Study Abroad', 'Accreditation', 'Assistance'] },
      { title: 'Non-Citizen', items: ['IPTA', 'IPTS', 'Scholarship'] },
    ],
  },
]

// ── Why Malaysia info cards ────────────────────────────────────────────────────
const infoCards = [
  { icon: GraduationCap, title: 'Globally Recognised Degrees & International Partnerships', desc: 'Many Malaysian universities have academic collaborations with the UK, Australia, USA, Europe, and New Zealand. Some degrees are fully accredited by global bodies such as ACCA, CIMA, ABET, and AACSB, giving students worldwide acceptance.' },
  { icon: Globe2, title: 'World-Class Education at an Affordable Cost', desc: 'Malaysia offers high-quality education aligned with UK, Australian, and international standards — but at 70% lower tuition fees and living expenses. Students get premium quality without the financial burden associated with Western countries.' },
  { icon: GraduationCap, title: 'Pathways to the UK, Australia, and Europe', desc: 'Many universities offer credit transfer programmes, allowing students to start their studies in Malaysia and complete them in top universities abroad — reducing total cost by 50–60%.' },
  { icon: Shield, title: 'Post-Study One-Year Visa in Malaysia (Graduate Employment Pass)', desc: 'Malaysia allows international graduates to stay back for one year after completing their studies to explore job opportunities under the Graduate Pass / Special Pass. This stay-back option helps students gain work experience and transition smoothly into employment.' },
]

export default function MalaysiaSection() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <div className="bg-linear-to-br from-slate-50 via-white to-blue-50">
      {/* Why Malaysia */}
      <section className="container mx-auto px-6 py-8 lg:py-10">
        <div className="text-center mb-10">
          <h2 className="text-5xl lg:text-6xl font-bold bg-linear-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-3">
            Study in Malaysia
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Global Recognition, Affordable Education, International Pathways & Post-Study Opportunities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
          {/* Image grid + video */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-3xl shadow-xl aspect-[4/5] group">
                <img src="/Malaysian students.webp" alt="International students" width={400} height={500} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative overflow-hidden rounded-3xl shadow-xl aspect-[4/5] group mt-6">
                <img src="/download (20).webp" alt="Kuala Lumpur skyline" width={400} height={500} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="relative overflow-hidden rounded-3xl shadow-xl aspect-video col-span-2 group">
                <img src="/Malaysian.webp" alt="Campus life" width={800} height={450} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>

            {/* Video */}
            <div className="relative bg-linear-to-br from-slate-900 to-blue-900 rounded-3xl shadow-2xl overflow-hidden group">
              <div className="aspect-video relative">
                {!videoOpen ? (
                  <button onClick={() => setVideoOpen(true)} className="w-full h-full cursor-pointer relative block">
                    <img src="https://i.ytimg.com/vi/hbZzfWnfJqw/sddefault.jpg" alt="Study in Malaysia video" width={640} height={480} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <div className="bg-white rounded-full p-5 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Play className="w-12 h-12 text-blue-600" fill="currentColor" />
                      </div>
                      <p className="text-white/90 text-sm font-semibold tracking-widest mt-5">WATCH NOW</p>
                    </div>
                  </button>
                ) : (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/hbZzfWnfJqw?autoplay=1&rel=0&modestbranding=1"
                    title="Study in Malaysia video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-5">
            {infoCards.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-white/80 rounded-3xl p-7 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 group">
                  <div className="flex items-start space-x-5">
                    <div className="bg-linear-to-br from-[#003893] to-[#003893] rounded-2xl p-4 shadow-md shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats counter section */}
      <section className="relative py-8 sm:my-4 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-amber-50 opacity-70" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#003893] mb-2">Gateway to World-Class Education in Malaysia</h2>
            <p className="text-base md:text-lg text-gray-600">Study in a globally respected education hub offering recognised degrees, multicultural campuses, and future-ready skills.</p>
            <div className="w-24 h-1 bg-linear-to-r from-[#003893] to-[#D4AF37] mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="group relative bg-white/80 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-white/30 hover:scale-105">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-linear-to-br from-[#003893] to-[#0052CC] rounded-lg text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-center mb-1">
                    <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </div>
                  <p className="text-xs text-gray-600 text-center leading-snug">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Education system section */}
      <div className="py-4 md:py-8 bg-linear-to-br from-slate-50 to-slate-100 mt-[-1rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
              Education System in Malaysia
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-6xl mx-auto leading-relaxed px-2 sm:px-4 text-justify">
              Malaysia's education system offers accessible, high-quality learning from early childhood to higher education, guided by strong national standards and global benchmarks. Both Malaysian and international students benefit from structured academic pathways, modern teaching approaches, and flexible opportunities for lifelong learning.
            </p>
          </div>
          <div className="text-center mb-5 md:mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 tracking-tight">Education Pathway In Malaysia</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            {stages.map((stage) => {
              const Icon = stage.icon
              const isHigher = stage.title === 'Higher Education'
              return (
                <div key={stage.title} className={`rounded-xl shadow-md bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col ${isHigher ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                  <div className="bg-linear-to-br from-[#003893] to-[#003893] p-4 md:p-5 rounded-t-xl">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-white/20 p-1.5 md:p-2 rounded-lg backdrop-blur-sm">
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-white">{stage.title}</h4>
                    </div>
                  </div>
                  <div className="bg-white p-4 md:p-5 flex-grow rounded-b-xl">
                    {!isHigher ? (
                      <ul className="space-y-1.5 md:space-y-2">
                        {stage.items?.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 group text-sm md:text-base">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span className="group-hover:text-slate-900 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-4 md:space-y-5">
                        {stage.sections?.map((section, idx) => (
                          <div key={idx}>
                            <h5 className="font-semibold text-slate-900 mb-1.5 md:mb-2 pb-1 border-b border-slate-200 text-sm md:text-base">{section.title}</h5>
                            <ul className="space-y-1.5 md:space-y-2">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2 text-slate-700 group text-sm md:text-base">
                                  <span className="text-slate-400 mt-0.5">•</span>
                                  <span className="group-hover:text-slate-900 transition-colors">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
