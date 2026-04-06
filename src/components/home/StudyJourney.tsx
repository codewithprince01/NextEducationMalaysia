'use client'

import { useState } from 'react'
import Link from 'next/link'

// Inline SVGs — eliminates ~20-30KB lucide-react from StudyJourney chunk
const GraduationCapIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
const FileCheckIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
const PlaneIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 3 21 3c0 0-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
const CompassIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
const WalletIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>


const steps = [
  { id: 1, title: 'Choose Course & Check Eligibility', subtitle: 'Find Right Course', icon: <GraduationCapIcon />, href: '/courses-in-malaysia', color: 'from-[#003893] to-[#0052CC]' },
  { id: 2, title: 'Apply & Get Offer Letter', subtitle: 'Submit documents & complete application', icon: <FileCheckIcon />, href: '/signup', color: 'from-[#0052CC] to-[#0066FF]' },
  { id: 3, title: 'Start Student Visa Process', subtitle: 'Begin EMGS approval', icon: <CompassIcon />, href: '/signup', color: 'from-[#0066FF] to-[#3385FF]' },
  { id: 4, title: 'Pay Fees & Confirm Seat', subtitle: 'Complete payment to secure your admission', icon: <WalletIcon />, href: '/signup', color: 'from-[#3385FF] to-[#66A3FF]' },
  { id: 5, title: ' Fly to Malaysia', subtitle: 'Start study in Malaysia', icon: <PlaneIcon />, href: '/signup', color: 'from-[#66A3FF] to-[#99C2FF]' },
]

export default function StudyJourney() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="pt-6 px-4 bg-linear-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">Start Your Study in Malaysia Journey</h2>
          <p className="text-slate-600 text-lg">Follow simple, guided steps to secure admission to Malaysia&apos;s top universities.</p>
        </div>

        <div className="relative">
          {/* Connector line – desktop only */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-linear-to-r from-[#003893] via-[#0066FF] to-[#99C2FF] rounded-full mx-16 w-[calc(100%-8rem)]" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 relative">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
                onMouseEnter={() => setHovered(step.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Single <a> replaces nested <Link><button> — fixes touch target + invalid HTML */}
                <Link
                  href={step.href}
                  aria-label={step.title}
                  className="group relative mb-4 block"
                >
                  <div className={`relative z-10 w-20 h-20 rounded-full bg-linear-to-br ${step.color} flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ease-out ${hovered === step.id ? 'scale-125 shadow-2xl' : 'scale-100'} group-hover:scale-125 group-hover:shadow-2xl`}>
                    {step.icon}
                  </div>
                  <div className={`absolute inset-0 rounded-full bg-linear-to-br ${step.color} opacity-0 blur-xl transition-opacity duration-300 ${hovered === step.id ? 'opacity-40' : ''} group-hover:opacity-40`} />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200 font-bold text-slate-700 text-sm z-20">
                    {step.id}
                  </div>
                </Link>

                <div className="text-center">
                  <h3 className={`font-bold text-lg mb-1 transition-all duration-300 ${hovered === step.id ? 'text-slate-900 scale-105' : 'text-slate-800'}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{step.subtitle}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="md:hidden w-px h-12 bg-linear-to-b from-slate-300 to-transparent mx-auto my-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          {/* Single <a> — fixes nested Link>button touch target issue */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-[#003893] to-[#0066FF] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <SparklesIcon />
            Start Your Study Abroad Journey
          </Link>
        </div>

      </div>
    </section>
  )
}
