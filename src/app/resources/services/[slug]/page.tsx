import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SITE_URL } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Clock, GraduationCap, Globe, CheckCircle, FileText, TrendingUp,
  Briefcase, Users, MapPin, Building2, RefreshCw, Activity, Shield,
  Camera, Plane, DollarSign, BookOpen, AlertCircle, AlertTriangle,
  Heart, Check, ClipboardCheck, UserCheck, Calendar, ListChecks, ArrowRight
} from 'lucide-react'

import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import { getServiceBySlug } from '@/lib/queries/resources'
import { resolveServiceMeta } from '@/lib/seo/metadata'
import { serializeBigInt } from '@/lib/utils'

interface Params { params: Promise<{ slug: string }> }

/* ========================================================================
   DISCOVER MALAYSIA — exact copy of ServicesDiscover.jsx + all 7 sub-components
   ======================================================================== */

function DiscoverHero() {
  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Jobs & Career Opportunities in Malaysia
          </h1>
          <p className="text-xl text-emerald-50 max-w-3xl mx-auto">
            Your complete guide to working in Malaysia as an international student
            - during studies, after graduation, and beyond
          </p>
        </div>
      </div>
    </header>
  )
}

function DiscoverIntroCards() {
  return (
    <section className="mb-16">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-200">
          <div className="bg-emerald-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">During Studies</h3>
          <p className="text-gray-600">Part-time work opportunities while you study</p>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-200">
          <div className="bg-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">After Graduation</h3>
          <p className="text-gray-600">Transition from student to professional</p>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-orange-50 p-8 rounded-xl border border-amber-200">
          <div className="bg-amber-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Jobs Market</h3>
          <p className="text-gray-600">Professional opportunities for foreigners</p>
        </div>
      </div>
    </section>
  )
}

function WorkingDuringStudies() {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Working During Your Studies</h2>
      </div>
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Work Permit Requirements</h3>
        <p className="text-gray-700 mb-4 leading-relaxed">
          International students in Malaysia are allowed to work part-time during
          semester breaks and holidays, subject to approval from the Immigration
          Department of Malaysia.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">Allowed Work Hours</h4>
            <ul className="space-y-2 text-gray-700">
              {['Maximum 20 hours per week during semester breaks', 'Full-time during semester holidays (exceeding 7 days)', 'No work allowed during academic sessions'].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">Permitted Sectors</h4>
            <ul className="space-y-2 text-gray-700">
              {['Restaurants and hotels', 'Retail and mini markets', 'Petrol stations'].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <h4 className="font-bold text-blue-900 mb-2">Application Process</h4>
        <p className="text-blue-800 leading-relaxed">
          Students must apply through their institution&apos;s international office.
          The university will submit the application to the Immigration Department
          on your behalf. Processing typically takes 2-4 weeks.
        </p>
      </div>
    </section>
  )
}

function AfterGraduation() {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">After Graduation</h2>
      </div>
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Post-Study Work Opportunities</h3>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Employment Pass (Category I, II, III)</h4>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  Fresh graduates can apply for an Employment Pass if they secure
                  a job offer from a Malaysian company. The employer typically
                  sponsors this pass.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Minimum Requirements:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Bachelor&apos;s degree or higher qualification</li>
                    <li>• Monthly salary RM 3,000 - RM 5,000+</li>
                    <li>• Job offer from a Malaysian company</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">Graduate Job Search Pass</h4>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  Special pass allowing graduates to stay for 12 months for job search.
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-emerald-900 mb-2">Key Benefits:</p>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li>• Valid for 12 months</li>
                    <li>• Can attend job interviews and network</li>
                    <li>• Convert to Employment Pass upon securing work</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-bold text-gray-900 mb-4">In-Demand Industries</h4>
          <ul className="space-y-3 text-gray-700">
            {['IT & Software Development', 'Engineering & Manufacturing', 'Finance & Banking', 'Healthcare & Pharmaceuticals', 'Digital Marketing & E-commerce'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-bold text-gray-900 mb-4">Average Starting Salaries</h4>
          <div className="space-y-3">
            {([['IT & Software', 'RM 3,500 - 5,500'], ['Engineering', 'RM 3,200 - 5,000'], ['Finance', 'RM 3,000 - 4,500'], ['Marketing', 'RM 2,800 - 4,000'], ['Healthcare', 'RM 3,500 - 6,000']] as const).map(([field, salary], i) => (
              <div key={field} className={`flex justify-between items-center ${i !== 4 ? 'pb-3 border-b border-gray-200' : ''}`}>
                <span className="text-gray-700">{field}</span>
                <span className="font-bold text-gray-900">{salary}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function DirectJobsMarket() {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-amber-600 w-12 h-12 rounded-lg flex items-center justify-center">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Direct Jobs Market for Foreigners</h2>
      </div>
      <div className="bg-gray-50 rounded-xl p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Employment Options</h3>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Malaysia actively welcomes skilled foreign professionals. Various
          employment pass categories cater to different skill levels and industries.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { cat: 'Category I', title: 'Top-Level Positions', salary: 'RM 10,000+', dur: 'Up to 5 years', roles: 'Senior executives, C-level positions', color: 'bg-amber-100 text-amber-900' },
            { cat: 'Category II', title: 'Mid-Level Positions', salary: 'RM 5,000 - 9,999', dur: 'Up to 2 years', roles: 'Managers, specialists', color: 'bg-blue-100 text-blue-900' },
            { cat: 'Category III', title: 'Entry-Level Positions', salary: 'RM 3,000 - 4,999', dur: 'Up to 1 year', roles: 'Graduates, junior staff', color: 'bg-emerald-100 text-emerald-900' },
          ].map((item) => (
            <div key={item.cat} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center mb-4">
                <div className={`inline-block px-4 py-2 rounded-full ${item.color}`}>
                  <span className="font-bold">{item.cat}</span>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-3 text-center">{item.title}</h4>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><strong>Salary:</strong> {item.salary}</p>
                <p><strong>Duration:</strong> {item.dur}</p>
                <p><strong>Roles:</strong> {item.roles}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Popular Job Portals</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">General Job Portals</h4>
            <ul className="space-y-2 text-gray-700">
              {['JobStreet Malaysia', 'LinkedIn Malaysia', 'Indeed Malaysia', 'Ricebowl'].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Specialized Portals</h4>
            <ul className="space-y-2 text-gray-700">
              {['Tech in Asia Jobs (Tech)', 'eFinancialCareers (Finance)', 'Hiredly (Tech & Startups)', 'Glints (Regional)'].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <Users className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Malaysia Tech Talent Program</h4>
            <p className="text-gray-700 leading-relaxed mb-3">
              Streamlined visa processing and special benefits for tech
              professionals in AI, blockchain, etc.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Fast-track processing', 'Family inclusion', 'Long-term stay'].map((b) => (
                <span key={b} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DiscoverResources() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Important Resources</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Immigration Department', desc: 'Official visa information' },
          { title: 'TalentCorp Malaysia', desc: 'Professional talent programs' },
          { title: 'MDEC', desc: 'Digital economy careers' },
          { title: 'University Career Centers', desc: 'Campus placement support' },
        ].map((res) => (
          <div key={res.title} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-900 mb-2">{res.title}</h4>
            <p className="text-sm text-gray-600">{res.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function DiscoverCTA() {
  return (
    <section className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 md:p-12 text-white text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Start Your Career in Malaysia?</h2>
      <p className="text-xl text-emerald-50 mb-6 max-w-2xl mx-auto">
        From gaining experience during your studies to building a long-term
        career, the pathway is clear and accessible.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/contact-us" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Contact Your University
        </Link>
        <Link href="/resources/services" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-blue-500">
          Learn More
        </Link>
      </div>
    </section>
  )
}

/* ========================================================================
   ADMISSION GUIDANCE — exact copy of ServiceAdmission.jsx + sub-components
   ======================================================================== */

const ADMISSION_STEPS = [
  { number: 1, title: 'Obtain Offer from Malaysian Institution', description: 'Apply to a recognised Malaysian institution registered with EMGS. Once accepted, you will receive an Offer Letter detailing your programme, duration, and tuition.', icon: FileText, duration: '2-4 weeks' },
  { number: 2, title: 'Prepare Required Documents', description: 'Collect all necessary documents including passport, photographs, academic certificates, English proficiency certificates, health forms, and proof of financial capacity.', icon: ClipboardCheck, duration: '1-2 weeks' },
  { number: 3, title: 'Institution Submits EMGS Application', description: 'Your institution submits the student pass application on your behalf through the EMGS online portal. Track your application status online.', icon: Shield, duration: '2-4 weeks' },
  { number: 4, title: 'Receive Visa Approval Letter (VAL)', description: 'Once approved, EMGS issues a VAL necessary for travel and entry. Keep both printed and digital copies safe.', icon: Check, duration: '1-2 days' },
  { number: 5, title: 'Apply for Entry Visa (if required)', description: 'Depending on your nationality, obtain a Single-Entry Visa (SEV) from a Malaysian embassy or consulate before arrival.', icon: UserCheck, duration: '1-2 weeks' },
  { number: 6, title: 'Travel to Malaysia & Medical Screening', description: 'Travel with your passport, VAL, and SEV. Undergo medical screening at an EMGS-approved clinic within the first few days.', icon: Plane, duration: '3-5 days' },
  { number: 7, title: 'Student Pass Endorsement', description: 'After medical clearance, the Immigration Department endorses your Student Pass sticker in your passport, valid for one year.', icon: Calendar, duration: '1-2 weeks' },
]

const ADMISSION_CHECKLIST = [
  'Receive Offer Letter from recognised institution',
  'Prepare passport (18+ months validity)',
  'Passport-size photograph (white background)',
  'Academic certificates and transcripts',
  'English proficiency certificate (IELTS/TOEFL/PTE)',
  'Health Declaration Form',
  'Proof of financial capacity',
  'Institution submits via EMGS portal',
  'Pay processing fees',
  'Receive VAL',
  'Obtain Entry Visa/SEV (if required)',
  'Travel to Malaysia',
  'Complete medical screening',
  'Get Student Pass sticker endorsed',
]

function AdmissionPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#f8fafc] via-[#eef2ff] to-[#f0f9ff]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4">
          <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-blue-600 p-2.5 md:p-3 rounded-lg shadow-lg flex items-center justify-center">
            <FileText className="w-5 md:w-6 h-5 md:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Malaysian Student Visa Process</h1>
            <p className="text-slate-600 mt-1 text-xs md:text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Complete guide to obtaining your student pass
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-14 space-y-14">
        {/* Notice */}
        <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4 shadow-lg">
          <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md flex-shrink-0 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="font-semibold text-lg text-indigo-900">Important Information</h3>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed">
              Processing times are approximate. Maintain <span className="font-medium">80% attendance</span> and satisfactory academic progress for annual renewals.
            </p>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed">
              Your Student Pass is valid for <span className="font-medium">one year</span> and must be renewed until programme completion.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-12">
          <div className="text-center mb-12">
            <span className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg inline-block">
              STEP-BY-STEP
            </span>
            <h2 className="text-4xl font-black mt-6 bg-linear-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Process Flow
            </h2>
            <div className="h-1 bg-linear-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mt-4 w-[200px]" />
          </div>
          <div className="space-y-8">
            {ADMISSION_STEPS.map((step, index) => {
              const Icon = step.icon
              const isLast = index === ADMISSION_STEPS.length - 1
              return (
                <div key={step.number} className="relative flex gap-8">
                  {!isLast && (
                    <div className="absolute left-[22px] top-14 w-[2px] bg-linear-to-b from-indigo-400 to-transparent h-full" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-lg flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                      </div>
                      <div className="bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {step.duration}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-linear-to-br from-indigo-600 to-blue-500 p-3 rounded-xl shadow-lg">
              <ListChecks className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Summary Checklist</h2>
              <p className="text-slate-500 text-sm">Ensure all items are prepared</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMISSION_CHECKLIST.map((item) => (
              <div key={item} className="flex gap-3 p-4 rounded-xl border bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-left">
                <CheckCircle className="w-5 h-5 mt-0.5 text-slate-300 flex-shrink-0" />
                <span className="text-sm text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Renewal Card */}
        <div className="bg-linear-to-br from-white via-purple-50 to-indigo-50 border border-purple-100 rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Renewal & Variation</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              Prior to expiry, your institution will submit a renewal application to EMGS.
              For programme changes or extensions, updated documents must be submitted early.
            </p>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-amber-900 text-sm font-medium flex gap-2">
                <span>💡</span> Note: Start the renewal process 2–3 months before your current pass expires.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/90 border-t py-6">
        <div className="max-w-5xl mx-auto px-8 flex justify-center items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <p className="text-slate-500 text-sm">Always verify requirements with your institution and EMGS.</p>
        </div>
      </footer>
    </div>
  )
}

/* ========================================================================
   VISA GUIDANCE — exact copy of ServiceVisaGuidance.jsx (all inline components)
   ======================================================================== */

function VisaHero() {
  return (
    <div className="relative bg-[#1e40af] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            Malaysia Student Visa Guidelines
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-6">
            <MapPin className="w-5 h-5" />
            <p className="text-xl sm:text-2xl text-blue-100 font-bold">2025 Edition</p>
          </div>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Complete guidance on eligibility, required documents, and
            application rules from Education Malaysia Global Services (EMGS)
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-8 sm:h-12 fill-white">
          <path d="M0,30 Q720,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </div>
  )
}

function DocumentCard({ icon, title, details, color }: { icon: React.ReactNode; title: string; details: string; color: string }) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-blue-200/50 hover:border-blue-300 transform hover:-translate-y-1">
      <div className={`relative z-10 bg-linear-to-br ${color} p-4 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9nPjwvc3ZnPg==')]" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-100" />
          </div>
        </div>
      </div>
      <div className="relative z-10 p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-[15px] font-semibold">{details}</p>
      </div>
    </div>
  )
}

const VISA_DOCUMENTS = [
  { icon: <FileText className="w-6 h-6" />, title: 'Passport', details: 'Must be valid for at least 18 months, include bio-data page, all visa pages, and observation page (if any).', color: 'from-blue-600 to-blue-700' },
  { icon: <Camera className="w-6 h-6" />, title: 'Photograph', details: 'Recent color photo, 35mm × 45mm, with a white background (check using EMGS Photo Checker).', color: 'from-blue-500 to-blue-600' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'Offer Letter', details: 'Official Letter of Acceptance from a Malaysian university or college recognized by EMGS.', color: 'from-blue-700 to-blue-800' },
  { icon: <FileText className="w-6 h-6" />, title: 'Academic Certificates', details: 'Certified copies of all previous academic records and transcripts.', color: 'from-blue-600 to-blue-700' },
  { icon: <Heart className="w-6 h-6" />, title: 'Health Declaration Form', details: 'Must be filled, signed, and uploaded with your visa application.', color: 'from-blue-500 to-blue-600' },
  { icon: <Globe className="w-6 h-6" />, title: 'English Proficiency', details: 'Valid test score (IELTS, TOEFL, PTE, MUET, OET, or Cambridge).', color: 'from-blue-700 to-blue-800' },
  { icon: <Shield className="w-6 h-6" />, title: 'Yellow Fever Certificate', details: 'Required if you are from a yellow-fever-risk country.', color: 'from-blue-600 to-blue-700' },
  { icon: <AlertTriangle className="w-6 h-6" />, title: 'Special Documents', details: 'NOC (Sudan), LOE (Iran), or others as notified by Immigration Malaysia (if applicable).', color: 'from-blue-500 to-blue-600' },
  { icon: <FileText className="w-6 h-6" />, title: 'Personal Bond', details: 'Paid by your institution to Immigration Malaysia; refundable after course completion.', color: 'from-blue-700 to-blue-800' },
]

const VISA_CHECKLIST = [
  'Offer Letter from a Malaysian university/college',
  'Valid passport (18+ months)',
  'Academic transcripts & Big certificates',
  'Health declaration form',
  'Proper photos (white background)',
  'Personal bond signed by university',
  'VAL approval from EMGS',
  'SEV (if required)',
  'Blue background (Academic Certificates)',
  'Visa Approval Letter from EMGS (VAL)',
]

function InfoCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-200 hover:border-blue-300 transition-all duration-300 overflow-hidden shadow-md h-full">
      <div className="bg-[#1e40af] px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <div className="text-white">{icon}</div>
          <h3 className="text-lg font-bold tracking-wide">{title}</h3>
        </div>
      </div>
      <div className="p-8 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
            <p className="text-slate-700 text-[15px] font-bold leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ADDITIONAL_SECTIONS = [
  { icon: <Building2 className="w-6 h-6" />, title: 'Additional Documentation Details', items: ['NOC for Iranian or Sudanese students', 'Eligibility letter for specific countries', 'Personal Bond and English Proficiency proof'] },
  { icon: <RefreshCw className="w-6 h-6" />, title: 'Renewal of Student Pass', items: ['Initiate renewal 3 months before expiry', 'Minimum 80% attendance required for Renewal', 'Must maintain a GPA of 2.0 or higher', 'The Renewal should be done', 'Must maintain at least 2.0/4.0 grade point average'] },
  { icon: <Activity className="w-6 h-6" />, title: 'Medical Screening Guidelines', items: ['Within 7 days of arrival in Malaysia', 'Mandatory for Student Pass approval', 'Must be performed at EMGS clinics', 'The Medical screening is really important'] },
  { icon: <Shield className="w-6 h-6" />, title: 'Health Insurance', items: ['Every International student must have valid approach health insurance', 'Covers Hospitalization and surgical needs as per Government Rules', 'The approach medical insurance with all basic approach details', 'The student insurance which are the basic of your application rules'] },
  { icon: <Camera className="w-6 h-6" />, title: 'Photo & Passport Format', items: ['Photos with blue background (Medical screening white background)', 'The Passport size photos dimensions', 'Proper dimensions (35mm x 45mm ) dimensions', 'Format with High Quality dimensions quality'] },
  { icon: <Plane className="w-6 h-6" />, title: 'Single Entry Visa ( SEV )', items: ['Check If your nationality matches for Single Entry Visa', 'Single Entry Visa is Mandatory and before Flying to Malaysia', 'Once you get the Approval Letter (VAL) then apply', 'Get from local Malaysian Embassy or Consulates of the Country', 'Get the e-Visa if you are using Malaysian Evisa documentation'] },
  { icon: <DollarSign className="w-6 h-6" />, title: 'Personal Bond', items: ['Each International student is participating with University by personal bond', 'Personal bond is depending on levels and Category with the students bond', 'Amount', 'New students must complete personal bond with their institute and apply', 'proper procedure'] },
  { icon: <BookOpen className="w-6 h-6" />, title: 'English Requirement Rules', items: ['IELTS/TOEFL is mandatory during long of 12 months', 'IELTS scorecard 1.0/TOEFL scorecard for approach details and application', 'accepted by IELTS, PTE Academic, CAE, CPE, MUET, as Language SCORE'] },
]

function VisaGuidancePage() {
  return (
    <div className="min-h-screen bg-white">
      <VisaHero />
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
          {/* Documents */}
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-2">Required Documents</h2>
              <p className="text-slate-500 font-bold text-lg">Ensure all documents are prepared and valid before applying</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VISA_DOCUMENTS.map((doc) => (
                <DocumentCard key={doc.title} {...doc} />
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-2">Summary Checklist</h2>
              <p className="text-slate-500 font-bold">everything you need before applying</p>
            </div>
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-8 h-8" />
                    <h3 className="text-2xl sm:text-3xl font-bold">Application Checklist</h3>
                  </div>
                </div>
                <div className="p-10 space-y-0">
                  {VISA_CHECKLIST.map((item) => (
                    <div key={item} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                      <div className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-slate-700 text-base font-bold flex-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Processing Time', icon: <Clock className="w-7 h-7 text-blue-600" />, description: 'Approximate processing time for Student Visa is 4–6 weeks from the date of completed application submission.', bg: 'bg-blue-50' },
                  { title: 'Step Compliant', icon: <Shield className="w-7 h-7 text-pink-600" />, description: 'Ensure all steps are followed precisely to avoid delays. Our expert team ensures 100% compliance for successful results.', bg: 'bg-pink-50' },
                ].map((card) => (
                  <div key={card.title} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-start space-x-6 hover:shadow-md transition-all duration-300">
                    <div className={`p-4 rounded-2xl ${card.bg} flex items-center justify-center shrink-0`}>{card.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-[#111827] mb-2">{card.title}</h4>
                      <p className="text-slate-600 text-[15px] font-semibold leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mb-2">Additional Information</h2>
              <p className="text-slate-500 font-bold text-lg">Important address for your apply application</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {ADDITIONAL_SECTIONS.map((section) => (
                <InfoCard key={section.title} {...section} />
              ))}
            </div>
            <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-10 max-w-6xl mx-auto">
              <div className="flex items-start space-x-6">
                <AlertCircle className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg italic mb-6">Important Items:</h3>
                  <ul className="space-y-4 text-blue-800 font-bold text-[15px]">
                    <li className="flex items-center gap-4">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                      Registration for Visa Approval Letter (VAL) must be done through official channels EMGS
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                      Processing fee payment confirmation is strongly dependent on the application process
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                      Students must maintain good academic performance and attendance for Renew.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ========================================================================
   ROUTING + METADATA
   ======================================================================== */

const SERVICE_TITLES: Record<string, string> = {
  'discover-malaysia': 'Jobs & Career Opportunities in Malaysia',
  'admission-guidance': 'Malaysian Student Visa Process | Admission Guidance',
  'visa-guidance': 'Malaysia Student Visa Guidelines | 2025 Edition',
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'discover-malaysia': 'Your complete guide to working in Malaysia as an international student - during studies, after graduation, and beyond.',
  'admission-guidance': 'Complete step-by-step guide to obtaining your Malaysian student pass through EMGS.',
  'visa-guidance': 'Complete guidance on eligibility, required documents, and application rules from Education Malaysia Global Services (EMGS).',
}


export async function generateStaticParams() {
  // Common slugs to pre-render
  return ['discover-malaysia', 'admission-guidance', 'visa-guidance', 'arrival-support', 'accommodation-assistance'].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Details | Education Malaysia' }
  return resolveServiceMeta(service)
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params
  const serviceData = await getServiceBySlug(slug)
  const service = serializeBigInt(serviceData) as any

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    { label: 'Services', href: '/resources/services' },
    { label: service?.headline || SERVICE_TITLES[slug] || slug },
  ]

  // Specialized High-Fidelity Pages
  if (slug === 'discover-malaysia') {
    return (
      <div className="min-h-screen bg-white">
        <Breadcrumb items={breadcrumbItems} />
        <DiscoverHero />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DiscoverIntroCards />
          <WorkingDuringStudies />
          <AfterGraduation />
          <DirectJobsMarket />
          <DiscoverResources />
          <DiscoverCTA />
        </main>
      </div>
    )
  }

  if (slug === 'admission-guidance') {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <AdmissionPage />
      </>
    )
  }

  if (slug === 'visa-guidance') {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <VisaGuidancePage />
      </>
    )
  }

  // Generic Fallback (Matching ServicesDetail.jsx)
  if (!service) {
    notFound()
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      {/* Generic Service Hero */}
      <section className="relative bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.headline}</h1>
          <div className="flex items-center justify-center space-x-2 mb-6 text-blue-100">
            <MapPin className="w-5 h-5" />
            <span className="text-xl font-bold">2025 Edition</span>
          </div>
          {service.description && <p className="text-xl text-white/90 max-w-3xl mx-auto line-clamp-2 text-center">{service.description.replace(/<[^>]*>?/gm, '').substring(0, 200)}...</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-white">
            <path d="M0,30 Q360,0 720,30 T1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Main Content matching ServicesDetail.jsx */}
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <main className="lg:w-2/3">
              <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-blue-50">
                {service.imgpath && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${service.imgpath}`}
                    alt={service.headline || ''}
                    className="w-full h-80 object-cover rounded-2xl mb-8 shadow-lg"
                  />
                )}
                <div className="prose prose-blue max-w-none text-slate-700 leading-relaxed font-medium">
                  {service.description && (
                    <div className="mb-12 last:mb-0">
                      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                        Overview
                      </h2>
                      <div dangerouslySetInnerHTML={{ __html: service.description }} />
                    </div>
                  )}
                </div>

              </div>
            </main>
            <aside className="lg:w-1/3 space-y-12">
              <FeaturedUniversities variant="sidebar" />
              <div className="bg-white rounded-3xl shadow-lg border border-blue-50 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Inquire About This Service</h3>
                {/* SideInquiryForm replacement or similar */}
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <p className="text-blue-900 font-bold mb-4">Need personalized guidance?</p>
                  <Link href="/contact-us" className="inline-block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
                    Contact Us Today
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      
      <style>{`
        .content-wrapper h1 { font-size: 2rem; font-weight: 700; color: #1e40af; margin-top: 2rem; margin-bottom: 1rem; }
        .content-wrapper h2 { font-size: 1.75rem; font-weight: 600; color: #1e3a8a; margin-top: 1.75rem; margin-bottom: 0.875rem; }
        .content-wrapper h3 { font-size: 1.5rem; font-weight: 600; color: #2563eb; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .content-wrapper p { margin-bottom: 1rem; line-height: 1.75; color: #334155; }
        .content-wrapper ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.25rem; }
        .content-wrapper li { margin-bottom: 0.625rem; color: #475569; }
        .content-wrapper table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .content-wrapper th { background-color: #3b82f6; color: white; padding: 0.75rem; text-align: left; }
        .content-wrapper td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
      `}</style>
    </>
  )
}
