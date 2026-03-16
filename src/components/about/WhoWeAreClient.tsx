'use client'

import { useState } from 'react'
import { 
  GraduationCap, FileText, Shield, DollarSign, Globe, Plane, 
  ArrowRight, Building2, Users, Handshake
} from 'lucide-react'

const SERVICES = [
  {
    icon: GraduationCap,
    title: "University & Course Selection",
    description: "Personalized guidance to help students choose the right university and program aligned with career goals and budget.",
    cta: "Explore Universities",
    href: "/universities",
  },
  {
    icon: FileText,
    title: "Application & Admission Support",
    description: "Complete assistance with documentation, application submission, and follow-up to ensure smooth admission process.",
    cta: "Start Application",
    href: "/contact-us",
  },
  {
    icon: Shield,
    title: "Student Visa & EMGS Guidance",
    description: "Expert support for visa applications and EMGS approval process, ensuring high success rates for international students.",
    cta: "Visa Assistance",
    href: "/contact-us",
  },
  {
    icon: DollarSign,
    title: "Scholarship & Fee Advisory",
    description: "Access exclusive scholarships and financial planning support to make quality education affordable for every student.",
    cta: "Find Scholarships",
    href: "/scholarships",
  },
  {
    icon: Globe,
    title: "International Student & Agent Support",
    description: "Dedicated support for students from 185+ countries and partnerships with education agents worldwide.",
    cta: "Partner With Us",
    href: "/contact-us",
  },
  {
    icon: Plane,
    title: "Pre-Departure & Arrival Assistance",
    description: "Comprehensive support from travel planning to airport pickup, accommodation, and settling in Malaysia.",
    cta: "Learn More",
    href: "/contact-us",
  },
]

const PARTNER_TABS = [
  {
    id: 'universities',
    icon: Building2,
    label: 'Universities',
    heading: 'For Universities',
    points: [
      'Partnered with esteemed institutions globally.',
      'Recruit highly qualified students via outreach programs.',
      'International student recruitment solutions, including marketing and support.',
      'Train and manage in-country agents to enhance reach and applications.',
      'Pre-screen applications to ensure quality and reduce workload.',
    ]
  },
  {
    id: 'students',
    icon: GraduationCap,
    label: 'Students',
    heading: 'For Students',
    points: [
      'Comprehensive services from counseling to visa processing.',
      'Smart tech-based search platforms to find best destinations & courses.',
      'Support with admissions, loans, test coaching, and allied services.',
    ]
  },
  {
    id: 'partners',
    icon: Handshake,
    label: 'Partners',
    heading: 'For Partners',
    points: [
      'Swift, Simple and Rewarding partner services.',
      'Empowerment through product training & tech platforms.',
      'High commissions, fast payments, and transparent practices.',
      'Global presence with 100+ universities in 6+ countries.',
    ]
  }
]

const WHY_CHOOSE_US = [
  { title: "Establish an India Office", description: "We will guide you in setting up your India office, including legal aspects like RBI license handling." },
  { title: "Market Research and Analysis", description: "We analyze markets and build effective strategies tailored to your institution's goals." },
  { title: "Marketing and Branding", description: "Expand your international reach and attract global candidates through education fairs and branding." },
  { title: "We Understand Business", description: "Our industry experience helps us understand and cater to the diverse needs of the education sector." },
  { title: "We Are Good At What We Do", description: "A skilled and experienced team providing cost-effective marketing solutions that deliver." },
  { title: "An Accomplished Team", description: "Our team works closely with clients to provide guidance and strategic planning throughout the process." },
]

export default function WhoWeAreClient() {
  const [activeTab, setActiveTab] = useState('universities')
  const currentTab = PARTNER_TABS.find(t => t.id === activeTab)!

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 to-slate-900/80" />
        <div className="relative max-w-[1400px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
            About Us
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Who We Are
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
            Britannica Overseas — a cutting-edge higher education recruitment, marketing and student enrollment specialist since 2015.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-20 space-y-24">
        {/* About + VMO */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 rounded-r-full" />
            <div className="mb-10 p-8 bg-blue-50 rounded-[2rem] border-l-4 border-blue-500">
              <p className="text-xl font-bold text-blue-800 italic leading-relaxed">
                "The Achievement of Perfection is our goal but Excellence is Guarantee!"
              </p>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-900">Britannica Overseas</strong> is the cutting edge of higher education's Recruitment, Marketing and student enrollment. We have been a well founded solutions specialist to our partner institutions since 2015.</p>
              <p>Britannica Overseas has been providing services for higher education marketing to over <span className="font-semibold text-blue-600">100 partner schools</span> across the globe. We have also launched multiple websites for different overseas study destinations like Malaysia, Germany, Canada, Australia and UK; hence, we receive millions of visitors every month.</p>
              <p>We are currently representing multiple individual education brands which cover everything under one roof from <span className="font-semibold text-gray-900">Admission to Marketing</span> and every section of an education system.</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {[
              { emoji: '👁️', title: 'Vision', content: 'Our vision is to make a transformative impact on the Study Abroad Service Sector through continual innovation in student services by connecting institutions, recruiters, and students across the globe.' },
              { emoji: '🚀', title: 'Mission', content: 'To simplify the Overseas Education Admission Process & provide World\'s Best Education Solutions. To strive to be the world\'s most reliable service brand.' },
              { emoji: '💎', title: 'Core Values', content: 'Integrity, Honesty, Commitment, Transparency, Excellence and Value Addition.' },
              { emoji: '🎯', title: 'Objectives', content: 'To Expand the Academic Horizons.' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tabs */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-center text-gray-900">We Work With Everyone</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {PARTNER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 p-10 md:p-16">
            <h3 className="text-3xl font-black text-gray-900 mb-8">{currentTab.heading}</h3>
            <ul className="space-y-4">
              {currentTab.points.map((p, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-gray-600 leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Why Choose Us Cards */}
        {activeTab === 'universities' && (
          <div className="space-y-10">
            <h2 className="text-3xl font-black text-center text-gray-900">Why Choose Us</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_CHOOSE_US.map((card) => (
                <div key={card.title} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200 transition-all group">
                  <h4 className="font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{card.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-gray-900">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">End-to-end guidance for international students — from course selection to arrival in Malaysia.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <div key={service.title} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <service.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{service.description}</p>
                  <a href={service.href} className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
                    {service.cta} <ArrowRight className="w-4 h-4" />
                  </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
