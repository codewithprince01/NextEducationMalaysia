'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, FileCheck, Plane, Compass, Sparkles, Wallet } from 'lucide-react'

const steps = [
  { id: 1, title: 'Choose Course & Check Eligibility', subtitle: 'Find Right Course', icon: <GraduationCap className="w-8 h-8" />, href: '/courses-in-malaysia', color: 'from-[#003893] to-[#0052CC]' },
  { id: 2, title: 'Apply & Get Offer Letter', subtitle: 'Submit documents & complete application', icon: <FileCheck className="w-8 h-8" />, href: '/signup', color: 'from-[#0052CC] to-[#0066FF]' },
  { id: 3, title: 'Start Student Visa Process', subtitle: 'Begin EMGS approval', icon: <Compass className="w-8 h-8" />, href: '/signup', color: 'from-[#0066FF] to-[#3385FF]' },
  { id: 4, title: 'Pay Fees & Confirm Seat', subtitle: 'Complete payment to secure your admission', icon: <Wallet className="w-8 h-8" />, href: '/signup', color: 'from-[#3385FF] to-[#66A3FF]' },
  { id: 5, title: 'Fly to Malaysia', subtitle: 'Start study in Malaysia', icon: <Plane className="w-8 h-8" />, href: '/signup', color: 'from-[#66A3FF] to-[#99C2FF]' },
]

export default function StudyJourney() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="pt-6 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">Start Your Study in Malaysia Journey</h2>
          <p className="text-slate-600 text-lg">Follow simple, guided steps to secure admission to Malaysia&apos;s top universities.</p>
        </div>

        <div className="relative">
          {/* Connector line – desktop only */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-[#003893] via-[#0066FF] to-[#99C2FF] rounded-full mx-16 w-[calc(100%-8rem)]" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-3 relative">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
                onMouseEnter={() => setHovered(step.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link href={step.href}>
                  <button
                    className="group relative mb-4 transition-all duration-300 ease-out"
                    aria-label={`Go to ${step.title}`}
                  >
                    <div className={`relative z-10 w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ease-out ${hovered === step.id ? 'scale-125 shadow-2xl' : 'scale-100'} group-hover:scale-125 group-hover:shadow-2xl`}>
                      {step.icon}
                    </div>
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-0 blur-xl transition-opacity duration-300 ${hovered === step.id ? 'opacity-40' : ''} group-hover:opacity-40`} />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-slate-200 font-bold text-slate-700 text-sm z-20">
                      {step.id}
                    </div>
                  </button>
                </Link>

                <div className="text-center">
                  <h3 className={`font-bold text-lg mb-1 transition-all duration-300 ${hovered === step.id ? 'text-slate-900 scale-105' : 'text-slate-800'}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{step.subtitle}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="md:hidden w-px h-12 bg-gradient-to-b from-slate-300 to-transparent mx-auto my-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#003893] to-[#0066FF] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
              <Sparkles className="w-5 h-5" />
              Start Your Study Abroad Journey
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
