'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import ContactForm from '@/components/forms/ContactForm'
import ContactLocation from '@/components/contact/ContactLocation'
import { LOCATIONS_DATA } from '@/lib/contact-data'

export default function ContactUsClient() {
  const [activeTab, setActiveTab] = useState('INDIA')

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      
      {/* ── 1. HERO SECTION (Normal Blue Brand Theme) ── */}
      <section className="relative pt-12 md:pt-16 pb-16 px-4 md:px-6 bg-blue-600 text-white overflow-hidden shadow-sm">
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold">
            <Sparkles size={13} className="text-yellow-300" />
            <span>Official University Admissions Support & Student Counseling</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Contact Education Malaysia
          </h1>

          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Get 100% free guidance on universities, eligibility, tuition fees, and student visas from our education advisors.
          </p>

          {/* Key Trust Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-3xl mx-auto">
            {[
              { val: '10,000+', label: 'Students Assisted' },
              { val: '100% Free', label: 'Admissions Guidance' },
              { val: '50+ Top', label: 'Partner Universities' },
              { val: '< 24 Hours', label: 'Fast Response' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 border border-white/15 rounded-2xl py-2.5 px-2 text-center">
                <span className="text-lg sm:text-xl font-black text-white block">{stat.val}</span>
                <span className="text-[11px] font-medium text-blue-100">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. QUICK CONTACT CARDS BAR ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: WhatsApp */}
          <a
            href="https://wa.me/919818560331"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Chat on WhatsApp</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">+91 98185 60331</p>
              <span className="text-[11px] text-slate-500 font-medium">Instant messaging support</span>
            </div>
          </a>

          {/* Card 2: Phone Hotline */}
          <a
            href="tel:+919818560331"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Phone className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Admissions Hotline</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">+91 98185 60331</p>
              <span className="text-[11px] text-slate-500 font-medium">Direct advisor call</span>
            </div>
          </a>

          {/* Card 3: Email */}
          <a
            href="mailto:info@educationmalaysia.in"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Official Email</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">info@educationmalaysia.in</p>
              <span className="text-[11px] text-slate-500 font-medium">Official support desk</span>
            </div>
          </a>

          {/* Card 4: Working Hours */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Working Hours</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Mon - Sat: 9:30 AM - 6:30 PM</p>
              <span className="text-[11px] text-slate-500 font-medium">Available via phone & email</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FORM & GLOBAL OFFICES SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Global Offices Directory */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">Global Offices</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Visit or connect with our regional branches</p>
                </div>
              </div>

              {/* Country Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-6 p-1.5 bg-slate-100 rounded-2xl">
                {Object.keys(LOCATIONS_DATA).map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveTab(country)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all duration-200 text-xs cursor-pointer ${
                      activeTab === country
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ContactLocation locations={LOCATIONS_DATA[activeTab as keyof typeof LOCATIONS_DATA]} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. BOTTOM CTA BAR (White Background) ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Ready to Explore Your Study Options in Malaysia?
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Explore 5,000+ accredited university programs and apply directly with 100% free counseling support.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
            >
              Browse Programs <ArrowRight size={16} />
            </Link>
            <Link
              href="/universities"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              View Universities
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
