'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
// Inline SVGs — eliminates lucide-react from the critical navbar bundle
const ChevronDown = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
)
const MenuIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
)
const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)
const ChevronRight = ({ size = 14, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width={size} height={size} className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
)
import Image from 'next/image'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

const RESOURCES_LINKS = {
  exams: [
    { href: '/resources/exams/muet', label: 'MUET' },
    { href: '/resources/exams/pte', label: 'PTE' },
    { href: '/resources/exams/toefl', label: 'TOEFL' },
    { href: '/resources/exams/ielts', label: 'IELTS' },
  ],
  services: [
    { href: '/resources/services/discover-malaysia', label: 'Discover Malaysia' },
    { href: '/resources/services/admission-guidance', label: 'Admission Guidance' },
    { href: '/resources/services/visa-guidance', label: 'Visa Guidance' },
  ],
  guidelines: [
    { href: '/resources/guidelines/graduate-pass', label: 'Graduate Pass' },
    { href: '/resources/guidelines/mqa', label: 'MQA' },
    { href: '/resources/guidelines/team-education-malaysia', label: 'Study Malaysia' },
  ],
  about: [
    { href: '/who-we-are', label: 'Who We Are' },
    { href: '/what-people-say', label: 'What Students Say' },
    { href: '/why-study', label: 'Why Study In Malaysia?' },
    { href: '/view-our-partners', label: 'View Our Partners' },
  ],
}

const NAV_LINKS = [
  { href: '/courses-in-malaysia', label: 'Courses' },
  { href: '/universities', label: 'Universities' },
  { href: '/specialization', label: 'Specialization' },
  { href: '/scholarships', label: 'Scholarship' },
  { href: '/blog', label: 'Blogs' },
]

export default function NavbarClient() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDropdownLocked, setIsDropdownLocked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string>('Profile')
  const { isAuthenticated: isLoggedIn, user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const toDisplayName = (value: string): string => {
    const cleaned = String(value || '').trim()
    if (!cleaned) return ''
    // Never derive display name from email.
    if (cleaned.includes('@')) return ''
    return cleaned
  }

  // useEffect for manual login check removed, handled by AuthContext

  useEffect(() => {
    setMenuOpen(false)
    setShowDropdown(false)
    setIsDropdownLocked(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuOpen) return
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setIsDropdownLocked(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!isLoggedIn) {
      setDisplayName('Profile')
      return
    }

    const fromUser = toDisplayName(String((user as any)?.name || ''))
    if (fromUser) {
      setDisplayName(fromUser)
      return
    }

    const fromStorage = typeof window !== 'undefined'
      ? toDisplayName(localStorage.getItem('student_name') || '')
      : ''
    if (fromStorage) {
      setDisplayName(fromStorage)
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setDisplayName('Profile')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          },
        })
        const data = await res.json()
        const fetchedName = toDisplayName(String(data?.data?.student?.name || ''))
        if (!cancelled && fetchedName) {
          localStorage.setItem('student_name', fetchedName)
          setDisplayName(fetchedName)
          return
        }
      } catch {}
      if (!cancelled) setDisplayName('Profile')
    })()

    return () => {
      cancelled = true
    }
  }, [isLoggedIn, user])

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[9999] h-[76px] bg-white/95 backdrop-blur-md text-black shadow-md border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" aria-label="Home" className="flex items-center h-full shrink-0">
            <Image
              src="/logo.png"
              alt="Education Malaysia Logo"
              width={240}
              height={56}
              priority
              className="h-10 sm:h-11 md:h-12 lg:h-13 w-auto max-w-[220px] sm:max-w-[260px] object-contain"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7 text-[15px] xl:text-[16px] 2xl:text-[17px] font-semibold text-slate-800">
            <Link
              href="/"
              className={`hover:text-[#003893] transition-colors ${
                isActive('/') ? 'text-[#003893] font-bold underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Home
            </Link>

            {/* Resources dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => !isDropdownLocked && setShowDropdown(true)}
              onMouseLeave={() => !isDropdownLocked && setShowDropdown(false)}
            >
              <button
                onClick={() => {
                  if (isDropdownLocked) {
                    setShowDropdown(false)
                    setIsDropdownLocked(false)
                  } else {
                    setShowDropdown(true)
                    setIsDropdownLocked(true)
                  }
                }}
                className="flex items-center gap-1.5 hover:text-[#003893] transition-colors cursor-pointer"
              >
                Resources
                <ChevronDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180 text-[#003893]' : ''}`} size={16} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[720px] max-w-[90vw] z-50">
                  <div className="bg-white/98 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-100 p-7 grid grid-cols-4 gap-6 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100" />

                    <div className="col-span-4 mb-1 flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-bold text-slate-900">Resources Hub</h3>
                      <Link href="/resources" className="text-[#003893] font-semibold hover:underline flex items-center text-xs">
                        View All <ChevronRight size={14} className="ml-1" />
                      </Link>
                    </div>

                    {[
                      { title: 'Exams', href: '/resources/exams', items: RESOURCES_LINKS.exams },
                      { title: 'Services', href: '/resources/services', items: RESOURCES_LINKS.services },
                      { title: 'Guidelines', href: '/resources/guidelines', items: RESOURCES_LINKS.guidelines },
                      { title: 'About Us', href: '/resources/about', items: RESOURCES_LINKS.about },
                    ].map(group => (
                      <div key={group.title}>
                        <Link href={group.href} className="font-bold text-[#003893] mb-2.5 hover:underline block text-sm">
                          {group.title}
                        </Link>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {group.items.map(item => (
                            <li key={item.href}>
                              <Link href={item.href} className="hover:text-[#003893] hover:underline transition-colors block py-0.5">
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-[#003893] transition-colors ${
                  isActive(link.href) ? 'text-[#003893] font-bold underline underline-offset-8 decoration-2' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA — min-w prevents CLS when text swaps from 'Get Started' to 'Profile' */}
            <Link
              href={isLoggedIn ? '/student/profile' : '/signup'}
              className="bg-[#003893] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl shadow-xs transition-all font-bold min-w-[125px] text-center inline-block text-[14.5px] xl:text-[15.5px] shrink-0 hover:shadow-md"
            >
              {isLoggedIn ? displayName : 'Get Started'}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-[#003893] p-2 rounded-xl hover:bg-slate-100 transition-colors z-60 cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <XIcon size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-[9998] transform transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4 font-medium overflow-y-auto h-full pt-24">
          <div className="absolute top-4 right-4">
            <button onClick={() => setMenuOpen(false)} className="text-blue-900 text-3xl" aria-label="Close menu">
              <XIcon size={24} />
            </button>
          </div>

          <Link
            href="/"
            className="block hover:text-blue-700 transition py-2 text-lg"
          >
            Home
          </Link>

          {/* Mobile resources accordion */}
          <div>
            <button
              onClick={() => setShowDropdown(p => !p)}
              className="flex items-center gap-1 w-full hover:text-blue-700 py-2 text-lg"
            >
              Resources <ChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} size={15} />
            </button>
            {showDropdown && (
              <div className="bg-gray-50 border p-4 mt-2 rounded-xl shadow space-y-4">
                {[
                  { title: 'Exams', href: '/resources/exams', items: RESOURCES_LINKS.exams },
                  { title: 'Services', href: '/resources/services', items: RESOURCES_LINKS.services },
                  { title: 'Guidelines', href: '/resources/guidelines', items: RESOURCES_LINKS.guidelines },
                  { title: 'About Us', href: '/resources/about', items: RESOURCES_LINKS.about },
                ].map(group => (
                  <div key={group.title}>
                    <Link href={group.href} className="text-blue-600 font-semibold block">{group.title}</Link>
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href} className="block pl-2 py-1 text-sm hover:text-blue-700">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block hover:text-blue-700 transition py-2 text-lg"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={isLoggedIn ? '/student/profile' : '/signup'}
            className="w-full block bg-blue-900 text-white py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold min-w-[120px] text-center"
          >
            {isLoggedIn ? displayName : 'Get Started'}
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9997] lg:hidden"
          onClick={() => setMenuOpen(false)}
          role="button"
          aria-label="Close menu overlay"
        />
      )}
    </>
  )
}
