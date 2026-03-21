'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Breadcrumb from '@/components/Breadcrumb'
import {
  GraduationCap, FileText, Shield, DollarSign, Globe, Plane, ArrowRight
} from 'lucide-react'

const services = [
  { icon: GraduationCap, title: 'University & Course Selection', description: 'Personalized guidance to help students choose the right university and program aligned with career goals and budget.', cta: 'Explore Universities' },
  { icon: FileText, title: 'Application & Admission Support', description: 'Complete assistance with documentation, application submission, and follow-up to ensure smooth admission process.', cta: 'Start Application' },
  { icon: Shield, title: 'Student Visa & EMGS Guidance', description: 'Expert support for visa applications and EMGS approval process, ensuring high success rates for international students.', cta: 'Visa Assistance' },
  { icon: DollarSign, title: 'Scholarship & Fee Advisory', description: 'Access exclusive scholarships and financial planning support to make quality education affordable for every student.', cta: 'Find Scholarships' },
  { icon: Globe, title: 'International Student & Agent Support', description: 'Dedicated support for students from 185+ countries and partnerships with education agents worldwide.', cta: 'Partner With Us' },
  { icon: Plane, title: 'Pre-Departure & Arrival Assistance', description: 'Comprehensive support from travel planning to airport pickup, accommodation, and settling in Malaysia.', cta: 'Learn More' },
]

const cardData = [
  { emoji: '🏛️', title: 'Establish an India Office', description: 'We will guide you in setting up your India office, including legal aspects like RBI license handling.' },
  { emoji: '⚙️', title: 'Market Research and Analysis', description: 'We analyze markets and build effective strategies tailored to your institution\'s goals.' },
  { emoji: '🌏', title: 'Marketing and Branding', description: 'Expand your international reach and attract global candidates through education fairs and branding.' },
  { emoji: '⚙️', title: 'We Understand Business', description: 'Our industry experience helps us understand and cater to the diverse needs of the education sector.' },
  { emoji: '👥', title: 'We Are Good At What We Do', description: 'A skilled and experienced team providing cost-effective marketing solutions that deliver.' },
  { emoji: '🤝', title: 'An Accomplished Team', description: 'Our team works closely with clients to provide guidance and strategic planning throughout the process.' },
]

const tabContent: Record<string, { heading: string; items: string[] }> = {
  universities: { heading: 'For Universities', items: ['Partnered with esteemed institutions globally.', 'Recruit highly qualified students via outreach programs.', 'International student recruitment solutions, including marketing and support.', 'Train and manage in-country agents to enhance reach and applications.', 'Pre-screen applications to ensure quality and reduce workload.'] },
  students: { heading: 'For Students', items: ['Comprehensive services from counseling to visa processing.', 'Smart tech-based search platforms to find best destinations & courses.', 'Support with admissions, loans, test coaching, and allied services.'] },
  partners: { heading: 'For Partners', items: ['Swift, Simple and Rewarding partner services.', 'Empowerment through product training & tech platforms.', 'High commissions, fast payments, and transparent practices.', 'Global presence with 100+ universities in 6+ countries.'] },
}

export default function WhoWeAreClient() {
  const [activeTab, setActiveTab] = useState('universities')
  const tab = tabContent[activeTab]

  return (
    <div className="bg-gray-50">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'About Us', href: '/resources/about' },
          { label: 'Who We Are' },
        ]}
      />

      <div className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">
        About <span className="text-blue-600">Education Malaysia</span>
      </h2>

      {/* ABOUT SECTION */}
      <div className="mb-20">
        <div className="text-center mb-8">
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            About <span className="text-blue-600">Us</span>
          </h3>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full mx-auto mt-4" />
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* LEFT */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-blue-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
            <div className="mb-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-lg md:text-xl font-bold text-blue-800 italic leading-relaxed">
                "The Achievement of Perfection is our goal but Excellence is Guarantee!"
              </p>
            </div>
            <div className="space-y-6 text-gray-700 leading-relaxed text-base md:text-[17px]">
              <p><strong>Britannica Overseas</strong> is the cutting edge of higher education's Recruitment, Marketing and student enrollment. We have been a well founded solutions specialist to our partner institutions since 2015.</p>
              <p>Britannica Overseas has been providing services for higher education marketing to over <span className="font-semibold text-blue-600">100 partner schools</span> across the globe. We have also launched multiple websites for different overseas study destinations like Malaysia, Germany, Canada, Australia and UK; hence, we receive millions of visitors every month.</p>
              <p>With more to come in the near future, we are currently representing multiple individual education brands which cover everything under one roof from <span className="font-semibold text-gray-900">Admission to Marketing</span> and every section of an education system.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5 grid gap-6 content-start">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><span className="text-lg">👁️</span></div>
                <h3 className="text-xl font-bold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed pl-1">Our vision is to make a transformative impact on the Study Abroad Service Sector through continual innovation in student services by connecting institutions, recruiters, and students across the globe.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><span className="text-lg">🚀</span></div>
                <h3 className="text-xl font-bold text-gray-900">Mission</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 pl-1">
                <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span>To simplify the Overseas Education Admission Process & provide World's Best Education Solutions</span></li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span>To render scrupulous services and build robust business relationships</span></li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span>To strive to be the world's most reliable service brand</span></li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3"><span className="text-2xl">💎</span><h3 className="text-lg font-bold text-gray-900">Core Values</h3></div>
                <p className="text-gray-700 text-sm font-medium leading-relaxed">Integrity, Honesty, Commitment, Transparency, Excellence and Value Addition.</p>
              </div>
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3"><span className="text-2xl">🎯</span><h3 className="text-lg font-bold text-gray-900">Objectives</h3></div>
                <p className="text-gray-700 text-sm font-medium">To Expand the Academic Horizons.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {['universities', 'students', 'partners'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}>
            {tab === 'universities' && '🏛️'}{tab === 'students' && '🎓'}{tab === 'partners' && '🤝'}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 md:p-10 border">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{tab.heading}</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          {tab.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </motion.div>

      {/* SUPPORT */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Support</h3>
        <p className="text-gray-700">Our expert team assists students and partners through admission, visa, and post-enrollment processes. We are committed to excellence in global education services.</p>
      </div>

      {/* WHY CHOOSE US */}
      {activeTab === 'universities' && (
        <div className="mt-10">
          <div className="flex justify-center mb-6">
            <button className="bg-blue-600 text-white px-8 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition">Why Choose Us</button>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {cardData.slice(0, 3).map((card, i) => (
              <motion.div key={i} className="bg-white border rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300" whileHover={{ scale: 1.05 }}>
                <div className="mx-auto text-3xl text-blue-500 mb-4">{card.emoji}</div>
                <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                <p className="text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {cardData.slice(3).map((card, i) => (
              <motion.div key={i} className="bg-white border rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300" whileHover={{ scale: 1.05 }}>
                <div className="mx-auto text-3xl text-blue-500 mb-4">{card.emoji}</div>
                <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                <p className="text-gray-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES SECTION */}
      <div className="pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services – Your Pathway to Studying in Malaysia</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">End-to-end guidance for international students — from course selection to arrival in Malaysia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <service.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                <button className="text-blue-600 font-medium flex items-center space-x-2 group-hover:space-x-3 transition-all">
                  <span>{service.cta}</span><ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
