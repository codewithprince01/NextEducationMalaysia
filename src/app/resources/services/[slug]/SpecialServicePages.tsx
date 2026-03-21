'use client'

import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  ListChecks,
  MapPin,
  Plane,
  RefreshCw,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'

export function DiscoverMalaysiaPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Jobs & Career Opportunities in Malaysia</h1>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto">
            Your complete guide to working in Malaysia as an international student - during studies, after graduation, and beyond
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'During Studies', desc: 'Part-time work opportunities while you study', icon: Clock, bg: 'from-emerald-50 to-teal-50', iconBg: 'bg-emerald-600' },
              { title: 'After Graduation', desc: 'Transition from student to professional', icon: GraduationCap, bg: 'from-blue-50 to-cyan-50', iconBg: 'bg-blue-600' },
              { title: 'Direct Jobs Market', desc: 'Professional opportunities for foreigners', icon: Globe, bg: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-600' },
            ].map((card) => (
              <div key={card.title} className={`bg-gradient-to-br ${card.bg} p-8 rounded-xl border`}>
                <div className={`${card.iconBg} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-white" /></div>
            <h2 className="text-3xl font-bold text-gray-900">Working During Your Studies</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Work Permit Requirements</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              International students in Malaysia are allowed to work part-time during semester breaks and holidays, subject to approval from the Immigration Department of Malaysia.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Allowed Work Hours</h4>
                <ul className="space-y-2 text-gray-700">
                  {['Maximum 20 hours per week during semester breaks', 'Full-time during semester holidays (exceeding 7 days)', 'No work allowed during academic sessions'].map((t) => (
                    <li key={t} className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Permitted Sectors</h4>
                <ul className="space-y-2 text-gray-700">
                  {['Restaurants and hotels', 'Retail and mini markets', 'Petrol stations'].map((t) => (
                    <li key={t} className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" /><span>{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center"><GraduationCap className="w-6 h-6 text-white" /></div>
            <h2 className="text-3xl font-bold text-gray-900">After Graduation</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Post-Study Work Opportunities</h3>
            <div className="space-y-4">
              {[{ title: 'Employment Pass (Category I, II, III)', icon: FileText, bg: 'bg-blue-100', c: 'text-blue-600' }, { title: 'Graduate Job Search Pass', icon: TrendingUp, bg: 'bg-emerald-100', c: 'text-emerald-600' }].map((it) => (
                <div key={it.title} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className={`${it.bg} p-3 rounded-lg`}><it.icon className={`w-6 h-6 ${it.c}`} /></div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">{it.title}</h4>
                      <p className="text-gray-700">Malaysia provides structured pathways for graduates to transition into employment with employer sponsorship and pass conversion.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <Users className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Malaysia Tech Talent Program</h4>
              <p className="text-gray-700 mb-3">Streamlined visa processing and special benefits for skilled tech professionals.</p>
              <div className="flex flex-wrap gap-2">
                {['Fast-track processing', 'Family inclusion', 'Long-term stay'].map((b) => (
                  <span key={b} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Career in Malaysia?</h2>
          <p className="text-xl text-emerald-50 mb-6 max-w-2xl mx-auto">
            From gaining experience during your studies to building a long-term career, the pathway is clear and accessible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact-us" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">Contact Your University</Link>
            <Link href="/resources/services" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-blue-500">Learn More</Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export function AdmissionGuidancePage() {
  const steps = [
    { n: 1, t: 'Obtain Offer from Malaysian Institution', d: 'Apply to a recognised Malaysian institution registered with EMGS and receive your Offer Letter.', icon: FileText, dur: '2-4 weeks' },
    { n: 2, t: 'Prepare Required Documents', d: 'Collect passport, photographs, academic documents, and financial proof.', icon: ClipboardCheck, dur: '1-2 weeks' },
    { n: 3, t: 'Institution Submits EMGS Application', d: 'Your institution submits your application through the EMGS portal.', icon: Shield, dur: '2-4 weeks' },
    { n: 4, t: 'Receive Visa Approval Letter (VAL)', d: 'After approval, EMGS issues your VAL for travel and visa steps.', icon: Check, dur: '1-2 days' },
    { n: 5, t: 'Apply for Entry Visa (if required)', d: 'Apply for SEV from your nearest Malaysian embassy/consulate.', icon: UserCheck, dur: '1-2 weeks' },
    { n: 6, t: 'Travel to Malaysia & Medical Screening', d: 'Travel and complete medical screening at EMGS-approved clinic.', icon: Plane, dur: '3-5 days' },
    { n: 7, t: 'Student Pass Endorsement', d: 'Immigration endorses your student pass sticker in passport.', icon: Calendar, dur: '1-2 weeks' },
  ]

  const checklist = [
    'Receive Offer Letter from recognised institution',
    'Prepare passport (18+ months validity)',
    'Passport-size photograph (white background)',
    'Academic certificates and transcripts',
    'English proficiency certificate',
    'Health Declaration Form',
    'Proof of financial capacity',
    'Institution submits via EMGS portal',
    'Pay processing fees',
    'Receive VAL',
    'Obtain Entry Visa/SEV',
    'Travel to Malaysia',
    'Complete medical screening',
    'Get Student Pass sticker endorsed',
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] via-[#eef2ff] to-[#f0f9ff]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-3 rounded-lg shadow-lg"><FileText className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Malaysian Student Visa Process</h1>
            <p className="text-slate-600 mt-1 text-xs md:text-sm">Complete guide to obtaining your student pass</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-14 space-y-14">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-indigo-900">Important Information</h3>
          <p className="text-slate-700 text-sm md:text-base leading-relaxed mt-1">Maintain 80% attendance and satisfactory progress for yearly renewals.</p>
        </div>

        <div className="space-y-8">
          <div className="text-center mb-8">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold">STEP-BY-STEP</span>
            <h2 className="text-4xl font-black mt-6 text-slate-900">Process Flow</h2>
          </div>
          {steps.map((step, idx) => (
            <div key={step.n} className="relative flex gap-8">
              {idx !== steps.length - 1 && <div className="absolute left-[22px] top-14 w-[2px] h-full bg-gradient-to-b from-indigo-400 to-transparent" />}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold shrink-0">{step.n}</div>
              <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3"><div className="bg-indigo-100 p-2 rounded-lg"><step.icon className="w-5 h-5 text-indigo-600" /></div><h3 className="text-lg font-bold text-slate-900">{step.t}</h3></div>
                  <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 whitespace-nowrap">{step.dur}</div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{step.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-3 rounded-xl shadow-lg"><ListChecks className="w-6 h-6 text-white" /></div>
            <div><h2 className="text-2xl font-bold text-slate-900">Summary Checklist</h2><p className="text-slate-500 text-sm">Track your progress</p></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <div key={item} className="flex gap-3 p-4 rounded-xl border bg-white border-slate-200">
                <CheckCircle2 className="w-5 h-5 mt-0.5 text-slate-300" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export function VisaGuidancePage() {
  const docs = [
    { icon: FileText, title: 'Passport', details: 'Must be valid for at least 18 months and include all relevant pages.' },
    { icon: Camera, title: 'Photograph', details: 'Recent color photo, 35mm × 45mm, white background.' },
    { icon: BookOpen, title: 'Offer Letter', details: 'Official acceptance letter from Malaysian institution.' },
    { icon: Heart, title: 'Health Declaration Form', details: 'Signed form submitted with visa application.' },
    { icon: Globe, title: 'English Proficiency', details: 'IELTS/TOEFL/PTE/MUET/OET/Cambridge accepted.' },
    { icon: AlertTriangle, title: 'Special Documents', details: 'NOC/LOE or other docs as per nationality.' },
  ]

  const checklist = ['Offer Letter', 'Valid passport (18+ months)', 'Academic transcripts', 'Health declaration form', 'Photographs', 'VAL approval', 'SEV (if required)']

  const sections = [
    { icon: Building2, title: 'Additional Documentation Details' },
    { icon: RefreshCw, title: 'Renewal of Student Pass' },
    { icon: Activity, title: 'Medical Screening Guidelines' },
    { icon: Shield, title: 'Health Insurance' },
    { icon: Plane, title: 'Single Entry Visa (SEV)' },
    { icon: DollarSign, title: 'Personal Bond' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-[#1e40af] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center">
            <div className="flex justify-center mb-6"><div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-xl"><GraduationCap className="w-16 h-16 text-white" /></div></div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Malaysia Student Visa Guidelines</h1>
            <div className="flex items-center justify-center space-x-2 mb-6"><MapPin className="w-5 h-5" /><p className="text-xl sm:text-2xl text-blue-100 font-bold">2025 Edition</p></div>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">Complete guidance on eligibility, required documents, and application rules from EMGS.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        <div className="space-y-10">
          <div className="text-center"><h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-2">Required Documents</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docs.map((d) => (
              <div key={d.title} className="bg-white rounded-2xl shadow-lg border border-blue-200/50 p-5">
                <div className="bg-linear-to-br from-blue-600 to-blue-700 p-4 rounded-xl text-white inline-flex"><d.icon className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">{d.title}</h3>
                <p className="text-slate-600 leading-relaxed text-[15px] font-semibold">{d.details}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white"><h3 className="text-2xl sm:text-3xl font-bold">Application Checklist</h3></div>
          <div className="p-10 space-y-0">
            {checklist.map((item) => (
              <div key={item} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-blue-600" /></div>
                <p className="text-slate-700 text-base font-bold flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center"><h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-2">Additional Information</h2></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {sections.map((s) => (
              <div key={s.title} className="bg-white rounded-[20px] border border-slate-200 shadow-md">
                <div className="bg-[#1e40af] px-6 py-4 text-white flex items-center gap-4"><s.icon className="w-6 h-6" /><h3 className="text-lg font-bold tracking-wide">{s.title}</h3></div>
                <div className="p-8"><p className="text-slate-700 text-[15px] font-bold leading-relaxed">Follow official EMGS and institution guidance for this section.</p></div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-10 max-w-6xl mx-auto">
            <div className="flex items-start space-x-6"><AlertCircle className="w-8 h-8 text-blue-600 shrink-0 mt-1" /><p className="text-blue-800 font-bold text-[15px]">Registration for VAL and payment confirmation must be done through official channels.</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}

