import Link from 'next/link'
import {
  Shield,
  Award,
  TrendingUp,
  Eye,
  Target,
  ClipboardCheck,
  FileCheck,
  RefreshCw,
  BadgeCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  GraduationCap,
  Building2,
  Briefcase,
} from 'lucide-react'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import Breadcrumb from '@/components/Breadcrumb'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['MQA', 'Malaysian Qualifications Agency', 'resources-guidelines-mqa'],
    '/resources/guidelines/mqa',
    'MQA - Malaysian Qualifications Agency | Education Malaysia',
  )
}

const HERO_CARDS = [
  { icon: Shield, title: 'Quality Assured', desc: 'National standards for all accredited programmes' },
  { icon: Award, title: 'Globally Recognized', desc: 'International alignment and mobility' },
  { icon: TrendingUp, title: 'Continuous Improvement', desc: 'Driving excellence in higher education' },
]

const VISION_MISSION = [
  { icon: Eye, title: 'Vision', desc: 'To be a global authority in quality assurance of higher education' },
  {
    icon: Target,
    title: 'Mission',
    desc: 'To put in place a system of quality assurance for higher education recognised internationally and aligned with national development needs',
  },
]

const BENEFITS = [
  {
    icon: Shield,
    title: 'Quality Standards',
    description: 'Assures that programmes meet national quality standards and have been evaluated against recognised criteria',
  },
  {
    icon: BadgeCheck,
    title: 'Employment Recognition',
    description: 'Supports recognition of qualifications for employment, especially in the public sector, and for further studies',
  },
  {
    icon: Globe,
    title: 'International Mobility',
    description: 'Enhances comparability and mobility of qualifications within Malaysia and internationally through MQF and MQR',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Improvement',
    description: 'Helps institutions with credibility, benchmarking, continuous improvement and regulatory compliance',
  },
]

const KEY_ROLES = [
  {
    icon: ClipboardCheck,
    title: 'Provisional Accreditation',
    description: 'New programmes that meet minimum requirements receive provisional accreditation to begin operations',
  },
  {
    icon: FileCheck,
    title: 'Evidence Submission',
    description: 'Institutions provide comprehensive evidence of teaching quality, assessments, resources, and governance',
  },
  {
    icon: Award,
    title: 'Full Accreditation',
    description: 'After producing graduates and demonstrating quality outcomes, programmes can achieve full accreditation',
  },
  {
    icon: RefreshCw,
    title: 'MQR Registration',
    description: 'Accredited programmes are listed on the Malaysian Qualifications Register with full details',
  },
]

const ACCREDITATION_STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Provisional Accreditation',
    description: 'New programmes that meet minimum requirements receive provisional accreditation to begin operations',
    details: ['Initial evaluation', 'Minimum standards check', 'Curriculum review'],
  },
  {
    icon: FileCheck,
    title: 'Evidence Submission',
    description: 'Institutions provide comprehensive evidence of teaching quality, assessments, resources, and governance',
    details: ['Teaching & learning methods', 'Faculty qualifications', 'Infrastructure & support services'],
  },
  {
    icon: Award,
    title: 'Full Accreditation',
    description: 'After producing graduates and demonstrating quality outcomes, programmes can achieve full accreditation',
    details: ['Graduate outcomes review', 'Quality assurance', 'Stakeholder feedback'],
  },
  {
    icon: RefreshCw,
    title: 'MQR Registration',
    description: 'Accredited programmes are listed on the Malaysian Qualifications Register with full details',
    details: ['Public verification', 'Validity period', 'Continuous monitoring'],
  },
]

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: 'For Students',
    bgColor: 'from-emerald-50 to-teal-50',
    color: 'from-emerald-600 to-teal-600',
    points: [
      'Check if your programme is MQA-accredited via the MQR before enrolling',
      'Ensures your qualification will be recognised by employers and for further studies',
      'Makes you eligible for government education loans and financial support',
      'Guarantees your programme meets national quality standards',
      'Provides assurance for postgraduate programme entry requirements',
    ],
  },
  {
    icon: Building2,
    title: 'For Institutions',
    bgColor: 'from-teal-50 to-cyan-50',
    color: 'from-teal-600 to-cyan-600',
    points: [
      'Must ensure programmes meet MQA standards for accreditation',
      'Need to maintain accreditation status through continuous quality assurance',
      'Required to continuously improve teaching and learning quality',
      'Must demonstrate compliance with national education standards',
      'Benefit from enhanced credibility and reputation through accreditation',
    ],
  },
  {
    icon: Briefcase,
    title: 'For Employers',
    bgColor: 'from-cyan-50 to-blue-50',
    color: 'from-cyan-600 to-blue-600',
    points: [
      'Qualified holders from MQA-accredited programmes provide quality assurance',
      'Non-accredited programmes may pose risks for employment recognition',
      'Accreditation ensures graduates meet industry-relevant standards',
      'Critical for public sector employment and professional registrations',
      'Provides confidence in the competency and knowledge of graduates',
    ],
  },
]

const STEPS = [
  {
    step: '1',
    title: 'Visit the MQR Website',
    description: 'Navigate to the Malaysian Qualifications Register online portal',
    action: 'www.mqa.gov.my/mqr',
  },
  {
    step: '2',
    title: 'Select Category',
    description: 'Choose between public, private, or other institution categories',
    action: 'Choose your institution type',
  },
  {
    step: '3',
    title: 'Search by Institution',
    description: 'Enter the name of the institution you want to verify',
    action: 'Type institution name',
  },
  {
    step: '4',
    title: 'Verify Programme',
    description: 'Check that your specific programme is listed and currently accredited',
    action: 'Confirm accreditation status',
  },
]

const WHY_VERIFY = [
  'Ensure your investment in education is recognized',
  'Avoid non-accredited programmes that may not be recognized',
  'Confirm eligibility for government loans and support',
  'Guarantee employment recognition, especially in public sector',
  'Ensure smooth transfer or progression to further studies',
]

const IMPORTANT_NOTES = [
  'Some institutions may have only certain programmes accredited',
  'Always verify the specific programme you intend to study',
  'Accreditation status can have expiry dates - check validity',
  'Non-accredited programmes may not qualify for government support',
  'International recognition depends on MQA accreditation',
]

export default function MQAPage() {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: 'Guidelines', href: '/resources/guidelines' },
          { label: 'MQA' },
        ]}
      />

      <section id="home" className="relative bg-gradient-to-br bg-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPBlVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 mb-4 shadow-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white">Statutory Quality Assurance Body</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">MQA - Malaysian Qualifications Agency</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
              Ensuring quality and standards in higher education across Malaysia since 2007
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a href="#about" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">Learn More</a>
              <a href="#check" className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-white">Verify Accreditation</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {HERO_CARDS.map((card, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"><card.icon className="w-6 h-6 text-white" /></div>
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">What is MQA?</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-3" />
            <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The Malaysian Qualifications Agency is the statutory body responsible for overseeing accreditation and quality assurance of higher education programmes and qualifications in Malaysia.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-6 mb-6 border border-blue-200 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">Established 2007</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Founded Under the Malaysian Qualifications Agency Act 2007</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  MQA began operations on 1 November 2007, with a mandate covering both public and private higher education institutions across Malaysia.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-600 rounded-full mt-2" /><p className="text-slate-700 leading-relaxed"><strong>Coverage:</strong> All public and private higher education institutions</p></li>
                  <li className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-600 rounded-full mt-2" /><p className="text-slate-700 leading-relaxed"><strong>Legal Framework:</strong> Malaysian Qualifications Agency Act 2007</p></li>
                </ul>
              </div>
              <div className="space-y-4">
                {VISION_MISSION.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-md border border-blue-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-lg"><item.icon className="w-5 h-5 text-white" /></div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Key Roles</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KEY_ROLES.map((role, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                  <role.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{role.title}</h4>
                <p className="text-slate-600 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="py-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">Why MQA Accreditation Matters</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto mb-3" />
            <p className="text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">For students, institutions, employers and external stakeholders, MQA accreditation provides critical assurance and recognition</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map((benefit, i) => (
              <div key={i} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-br from-blue-600 to-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg"><benefit.icon className="w-6 h-6 text-white" strokeWidth={2} /></div>
                <h3 className="text-xl font-bold mb-3 text-white">{benefit.title}</h3>
                <p className="text-blue-100 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-br from-blue-600/20 to-blue-400/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Critical for Success</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[{ label: 'Students', desc: 'Ensures qualification recognition and eligibility for loans' }, { label: 'Institutions', desc: 'Maintains standards and drives continuous improvement' }, { label: 'Employers', desc: 'Provides quality assurance for recruitment decisions' }].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent mb-2">{item.label}</div>
                  <p className="text-blue-100 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="py-8 bg-gradient-to-br from-blue-50 via-white to-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Accreditation Process</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-3" />
            <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">Understanding how programmes achieve and maintain MQA accreditation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ACCREDITATION_STEPS.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-2xl p-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="absolute -top-4 left-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{index + 1}</div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-12 h-12 rounded-xl flex items-center justify-center mb-3 mt-2 group-hover:scale-110 transition-transform duration-300"><step.icon className="w-6 h-6 text-blue-700" /></div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600 mb-3 leading-relaxed text-sm">{step.description}</p>
                  <ul className="space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {index < ACCREDITATION_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-sky-50 p-6 border-2 border-sky-200 shadow-lg">
              <h3 className="flex items-center text-2xl font-bold text-slate-900 mb-4">
                <span className="mr-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white"><FileCheck className="h-6 w-6" /></span>
                MQF - Malaysian Qualifications Framework
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-5">
                A unified system that classifies all post-secondary qualifications in Malaysia from certificate to doctoral level, covering both higher education and TVET sectors.
              </p>
              <div className="rounded-2xl bg-sky-100/70 p-4 border border-sky-200">
                <p className="text-base text-slate-700">Ensures consistency, transparency, and international comparability of Malaysian qualifications.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-sky-100/70 p-6 border-2 border-sky-200 shadow-lg">
              <h3 className="flex items-center text-2xl font-bold text-slate-900 mb-4">
                <span className="mr-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white"><Award className="h-6 w-6" /></span>
                MQR - Malaysian Qualifications Register
              </h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-5">
                The official register of accredited programmes and qualifications maintained by MQA, showing qualification level, credits, validity period, and institution name.
              </p>
              <div className="rounded-2xl bg-sky-200/50 p-4 border border-sky-200">
                <p className="text-base text-slate-700">Trusted source to verify the accreditation status of any programme.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="for-you" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">What This Means For You</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-3" />
            <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">Understanding the importance of MQA accreditation for different stakeholders</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {AUDIENCES.map((audience, index) => (
              <div key={index} className="group bg-white rounded-3xl border-2 border-blue-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`bg-gradient-to-br ${audience.bgColor} p-6 border-b-2 border-blue-200`}>
                  <div className={`bg-gradient-to-br ${audience.color} w-14 h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <audience.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{audience.title}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {audience.points.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-3 group/item">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm group-hover/item:text-slate-900 transition-colors">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-sky-50 rounded-3xl p-6 border-2 border-blue-200 shadow-lg">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center text-slate-900">Key Takeaway</h3>
              <p className="text-lg text-slate-700 text-center max-w-4xl mx-auto leading-relaxed">
                MQA accreditation is not just a formality - it&apos;s a critical assurance of quality, recognition, and standards that impacts students&apos; futures, institutional credibility, and employer confidence in the Malaysian higher education system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="check" className="py-8 bg-gradient-to-br from-blue-50 via-blue-50/30 to-blue-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">How to Verify Accreditation</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-3" />
            <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">Follow these simple steps to check if a programme is MQA-accredited</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STEPS.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mb-3 shadow-lg">{item.step}</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600 mb-3 leading-relaxed text-sm">{item.description}</p>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200"><p className="text-sm font-medium text-blue-700">{item.action}</p></div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4"><div className="bg-gradient-to-br from-blue-600 to-blue-400 p-3 rounded-xl"><CheckCircle2 className="w-5 h-5 text-white" /></div><h3 className="text-xl font-bold text-slate-800">Why Verify?</h3></div>
              <ul className="space-y-3">{WHY_VERIFY.map((item, idx) => (<li key={idx} className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" /><span className="text-slate-700 leading-relaxed text-sm">{item}</span></li>))}</ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4"><div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl"><AlertCircle className="w-5 h-5 text-white" /></div><h3 className="text-xl font-bold text-slate-800">Important Notes</h3></div>
              <ul className="space-y-3">{IMPORTANT_NOTES.map((item, idx) => (<li key={idx} className="flex items-start space-x-3"><div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" /><span className="text-slate-700 leading-relaxed text-sm">{item}</span></li>))}</ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm"><Search className="w-8 h-8 text-white" strokeWidth={2} /></div>
            <h3 className="text-2xl font-bold mb-3">Ready to Verify?</h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed">Visit the Malaysian Qualifications Register to check the accreditation status of any programme</p>
            <a href="https://www.mqa.gov.my/mqr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              <span>Visit MQR Portal</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
