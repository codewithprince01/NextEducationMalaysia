'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Inline SVGs — eliminates ~30-50KB lucide-react from Footer chunk
const FacebookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const InstagramIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const LinkedinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
const YoutubeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
const TwitterIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const MapPinIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const ArrowRightIcon = () => <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const PhoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>

const courses = [
  { href: "/accounting-finance-courses", label: "Accounting & Finance" },
  { href: "/business-management-courses", label: "Business Management" },
  { href: "/computer-engineering-courses", label: "Computer Engineering" },
  { href: "/medicine-courses", label: "Medicine" },
  { href: "/hospitality-courses", label: "Hospitality" },
  { href: "/civil-engineering-courses", label: "Civil Engineering" },
]

const levels = [
  { href: "/courses/pre-university", label: "Pre University" },
  { href: "/courses/diploma", label: "Diploma" },
  { href: "/courses/under-graduate", label: "Undergraduate" },
  { href: "/courses/post-graduate", label: "Post Graduate" },
  { href: "/courses/phd", label: "PhD" },
]

const support = [
  { href: "/faqs", label: "FAQs" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
]

const socials = [
  { Icon: FacebookIcon, url: 'https://www.facebook.com/educationmalaysia.in', color: 'hover:bg-blue-600', label: 'Facebook' },
  { Icon: InstagramIcon, url: 'https://www.instagram.com/educationmalaysia.in/', color: 'hover:bg-pink-500', label: 'Instagram' },
  { Icon: LinkedinIcon, url: 'https://www.linkedin.com/company/educationmalaysia/', color: 'hover:bg-blue-700', label: 'LinkedIn' },
  { Icon: YoutubeIcon, url: 'https://www.youtube.com/@educationmalaysia6986', color: 'hover:bg-red-600', label: 'YouTube' },
  { Icon: TwitterIcon, url: 'https://twitter.com/educatemalaysia/', color: 'hover:bg-sky-500', label: 'Twitter' },
]


export default function Footer() {
  // Guard against skewed system clocks set to future dates (e.g. 2026)
  const [year, setYear] = useState(2025)

  useEffect(() => {
    const y = new Date().getFullYear()
    setYear(y > 2025 ? 2025 : y)
  }, [])

  return (
    <footer className="overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/20 border-t border-slate-200/80" style={{ contain: 'layout', willChange: 'auto' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7 sm:pt-9 sm:pb-8">
        {/* Top section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 pb-6 mb-6 border-b border-slate-200/70">
          <div className="max-w-xl">
            <Link href="/" aria-label="Education Malaysia Home" className="inline-block mb-2">
              <Image
                src="/logo.png" 
                alt="Education Malaysia" 
                width={220}
                height={56}
                loading="lazy"
                className="w-48 sm:w-56 h-auto object-contain"
              />
            </Link>
            <p className="text-slate-600 text-[13.5px] sm:text-sm leading-relaxed mb-3">
              Guiding students with trusted counseling, scholarships, and admission support to build successful careers through Malaysian education.
            </p>
            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60">
                🎓 100+ Universities
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                ✨ Free Counseling
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/60">
                🏛️ MQA Approved
              </span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 w-full lg:w-auto border border-blue-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-slate-900 font-bold text-sm sm:text-[15px]">Start Your Journey Today</h4>
              </div>
              <p className="text-xs text-slate-500">Free admission guidance & visa support</p>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href="tel:+919818560331"
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#003893] to-[#004dc7] hover:from-[#002d75] hover:to-[#003893] text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all"
              >
                <PhoneIcon /> Call Now
              </a>
              <a
                href="mailto:info@educationmalaysia.in"
                className="flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#003893] border border-blue-200/80 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-2xs hover:border-blue-300 transition-all"
              >
                <MailIcon /> Email Us
              </a>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Office */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-slate-900 text-[14.5px] font-bold tracking-tight mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#003893] rounded-full"></span>
              Our Office
            </h3>
            <div className="space-y-2.5 text-[13.5px]">
              <div className="flex items-start gap-2.5 text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center shrink-0 border border-blue-100/60 mt-0.5">
                  <MapPinIcon />
                </div>
                <span className="leading-snug">B-16 Ground Floor, Mayfield Garden, Sector 50, Gurugram, Haryana 122002</span>
              </div>
              <a href="tel:+919818560331" className="flex items-center gap-2.5 text-slate-700 hover:text-blue-700 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#003893] group-hover:bg-[#003893] group-hover:text-white flex items-center justify-center shrink-0 border border-blue-100/60 transition-colors">
                  <PhoneIcon />
                </div>
                <span className="font-medium">+91-98185-60331</span>
              </a>
              <a href="mailto:info@educationmalaysia.in" className="flex items-center gap-2.5 text-slate-700 hover:text-blue-700 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#003893] group-hover:bg-[#003893] group-hover:text-white flex items-center justify-center shrink-0 border border-blue-100/60 transition-colors">
                  <MailIcon />
                </div>
                <span className="font-medium">info@educationmalaysia.in</span>
              </a>
            </div>
          </div>

          {/* Top Courses */}
          <div>
            <h3 className="text-slate-900 text-[14.5px] font-bold tracking-tight mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#003893] rounded-full"></span>
              Top Courses
            </h3>
            <ul className="space-y-1">
              {courses.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-slate-600 hover:text-blue-700 text-[13.5px] py-1 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors mr-2 shrink-0"></span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Levels */}
          <div>
            <h3 className="text-slate-900 text-[14.5px] font-bold tracking-tight mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#003893] rounded-full"></span>
              Study Levels
            </h3>
            <ul className="space-y-1">
              {levels.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-slate-600 hover:text-blue-700 text-[13.5px] py-1 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors mr-2 shrink-0"></span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 text-[14.5px] font-bold tracking-tight mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#003893] rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-1">
              {support.map(item => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="group flex items-center text-slate-600 hover:text-blue-700 text-[13.5px] py-1 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors mr-2 shrink-0"></span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gradient-to-r from-[#002466] via-[#003893] to-[#002466] py-3.5 border-t border-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-blue-100/90">
              <span>© {year} Education Malaysia. All rights reserved.</span>
              <span className="hidden sm:inline text-blue-300/40">|</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-blue-300/40">·</span>
              <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
            <div className="flex gap-2">
              {socials.map(({ Icon, url, color, label }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#003893] transition-all duration-300 flex items-center justify-center hover:scale-110 shadow-xs`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
