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
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="overflow-hidden" style={{ contain: 'layout', willChange: 'auto' }}>
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Top section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-8 mb-8 border-b border-gray-200">
            <div className="flex-1">
              <Image
                src="/logo.png" 
                alt="Education Malaysia" 
                width={256}
                height={64}
                loading="lazy"
                className="w-56 sm:w-64 mb-3 brightness-125 drop-shadow-lg"
              />
              <p className="text-gray-600 text-sm max-w-md leading-relaxed">
                Guiding students with trusted counseling, scholarships, and admission support to build successful careers through Malaysian education.
            </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 w-full lg:w-auto border border-blue-100">
              <h4 className="text-gray-800 font-semibold mb-3 text-sm sm:text-base">Start Your Journey Today</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+919818560331"
                  className="flex items-center gap-2 bg-[#003893] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-[#002966] transition-all"
                >
                  <PhoneIcon /> Call Now
                </a>
                <a
                  href="mailto:info@educationmalaysia.in"
                  className="flex items-center gap-2 border-2 border-[#003893] text-[#003893] px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-[#003893] hover:text-white transition-all"
                >
                  <MailIcon /> Email Us
                </a>
              </div>
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Office */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-[#003893]"><MapPinIcon /></span>
                <h3 className="text-gray-800 text-2xl font-bold leading-none">Our Office</h3>
                   </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 mt-2">
                B-16 Ground Floor, Mayfield Garden, Sector 50, Gurugram, Haryana 122002
              </p>
              <div className="space-y-2 text-sm">
                <a href="tel:+919818560331" className="flex items-center gap-2 text-gray-600 hover:text-[#003893] transition-colors">
                  <PhoneIcon /> +91-98185-60331
                      </a>
                <a href="mailto:info@educationmalaysia.in" className="flex items-center gap-2 text-gray-600 hover:text-[#003893] transition-colors">
                  <MailIcon /> info@educationmalaysia.in
                      </a>
                   </div>
                </div>

            {/* Top Courses */}
            <div>
              <h3 className="text-gray-800 text-2xl font-bold mb-4">Top Courses</h3>
              <ul className="space-y-2">
                {courses.map(item => (
                  <li key={item.href} className="group">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-gray-600 text-sm transition-all group-hover:text-[#003893] group-hover:translate-x-1"
                    >
                      <span className="opacity-0 transition-all group-hover:opacity-100"><ArrowRightIcon /></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
        </div>

            {/* Study Levels */}
            <div>
              <h3 className="text-gray-800 text-2xl font-bold mb-4">Study Levels</h3>
              <ul className="space-y-2">
                {levels.map(item => (
                  <li key={item.href} className="group">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-gray-600 text-sm transition-all group-hover:text-[#003893] group-hover:translate-x-1"
                    >
                      <span className="opacity-0 transition-all group-hover:opacity-100"><ArrowRightIcon /></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
          </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-800 text-2xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {support.map(item => (
                  <li key={item.href} className="group">
                    <Link 
                      href={item.href}
                      className="inline-flex items-center gap-1 text-gray-600 text-sm transition-all group-hover:text-[#003893] group-hover:translate-x-1"
                    >
                      <span className="opacity-0 transition-all group-hover:opacity-100"><ArrowRightIcon /></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </div>

      {/* Bottom bar */}
      <div className="bg-blue-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white text-xs sm:text-sm">
              © {year} Education Malaysia. All rights reserved.
            </p>
            <div className="flex gap-2">
              {socials.map(({ Icon, url, color, label }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 sm:w-9 sm:h-9 bg-white/10 ${color} rounded-full flex items-center justify-center text-white text-sm transition-all duration-300`}
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
