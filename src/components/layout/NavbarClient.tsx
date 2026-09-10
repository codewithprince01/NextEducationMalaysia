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
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
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
  const [mounted, setMounted] = useState(false)
  const [displayName, setDisplayName] = useState<string>('Profile')
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const { isAuthenticated: isLoggedIn, isLoading: isAuthLoading, user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync avatar from localStorage or custom event
  useEffect(() => {
    const syncAvatar = () => {
      try {
        const saved = localStorage.getItem('student_profile_avatar')
        if (saved) {
          setAvatarImage(saved)
        }
      } catch {}
    }
    syncAvatar()
    window.addEventListener('student_avatar_updated', syncAvatar)
    window.addEventListener('storage', syncAvatar)
    return () => {
      window.removeEventListener('student_avatar_updated', syncAvatar)
      window.removeEventListener('storage', syncAvatar)
    }
  }, [isLoggedIn])

  const toDisplayName = (value: string): string => {
    const cleaned = String(value || '').trim()
    if (!cleaned) return ''
    // Never derive display name from email.
    if (cleaned.includes('@')) return ''
    return cleaned
  }

  const initials = (displayName && displayName !== 'Profile' ? displayName : 'Student')
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST'

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
        const fetchedPhoto = data?.data?.student?.profile_image || data?.data?.student?.photo || data?.data?.student?.avatar
        if (!cancelled && fetchedPhoto && !localStorage.getItem('student_profile_avatar')) {
          setAvatarImage(fetchedPhoto)
        }
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
        <div className="site-container h-full flex items-center justify-between w-full">
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
              className={`hover:text-blue-600 transition-colors ${
                isActive('/') ? 'text-blue-600 font-bold underline underline-offset-8 decoration-2' : ''
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
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Resources
                <ChevronDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180 text-blue-600' : ''}`} size={16} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[720px] max-w-[90vw] z-50">
                  <div className="bg-white/98 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-100 p-7 grid grid-cols-4 gap-6 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100" />

                    <div className="col-span-4 mb-1 flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-bold text-slate-900">Resources Hub</h3>
                      <Link href="/resources" className="text-blue-600 font-semibold hover:underline flex items-center text-xs">
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
                        <Link href={group.href} className="font-bold text-blue-600 mb-2.5 hover:underline block text-sm">
                          {group.title}
                        </Link>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {group.items.map(item => (
                            <li key={item.href}>
                              <Link href={item.href} className="hover:text-blue-600 hover:underline transition-colors block py-0.5">
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
                className={`hover:text-blue-600 transition-colors ${
                  isActive(link.href) ? 'text-blue-600 font-bold underline underline-offset-8 decoration-2' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA — User profile when logged in, or Get Started */}
            {!mounted || isAuthLoading ? null : isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Vertical separator line matching screenshot */}
                <div className="h-8 w-[1px] bg-slate-200 shrink-0" aria-hidden="true" />

                <Link
                  href="/student/profile"
                  className="flex items-center gap-2.5 py-1 px-1.5 rounded-xl hover:bg-slate-50 transition-all shrink-0 group"
                  title="Go to Dashboard Profile"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                    {avatarImage ? (
                      <img src={avatarImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="text-left leading-none">
                    <p className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {displayName}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600 leading-tight mt-0.5">
                      Student
                    </p>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all font-bold min-w-[125px] text-center inline-block text-[14.5px] xl:text-[15.5px] shrink-0 hover:shadow-lg active:scale-[0.98]"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-blue-600 p-2 rounded-xl hover:bg-slate-100 transition-colors z-60 cursor-pointer"
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
            <button onClick={() => setMenuOpen(false)} className="text-slate-700 text-3xl hover:text-blue-600 transition-colors" aria-label="Close menu">
              <XIcon size={24} />
            </button>
          </div>

          <Link
            href="/"
            className="block hover:text-blue-600 transition py-2 text-lg"
          >
            Home
          </Link>

          {/* Mobile resources accordion */}
          <div>
            <button
              onClick={() => setShowDropdown(p => !p)}
              className="flex items-center gap-1 w-full hover:text-blue-600 py-2 text-lg"
            >
              Resources <ChevronDown className={`transition-transform ${showDropdown ? 'rotate-180 text-blue-600' : ''}`} size={15} />
            </button>
            {showDropdown && (
              <div className="bg-gray-50 border border-slate-200/80 p-4 mt-2 rounded-xl shadow-xs space-y-4">
                {[
                  { title: 'Exams', href: '/resources/exams', items: RESOURCES_LINKS.exams },
                  { title: 'Services', href: '/resources/services', items: RESOURCES_LINKS.services },
                  { title: 'Guidelines', href: '/resources/guidelines', items: RESOURCES_LINKS.guidelines },
                  { title: 'About Us', href: '/resources/about', items: RESOURCES_LINKS.about },
                ].map(group => (
                  <div key={group.title}>
                    <Link href={group.href} className="text-blue-600 font-semibold block">{group.title}</Link>
                    {group.items.map(item => (
                      <Link key={item.href} href={item.href} className="block pl-2 py-1 text-sm hover:text-blue-600">
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
              className="block hover:text-blue-600 transition py-2 text-lg"
            >
              {link.label}
            </Link>
          ))}

          {!mounted || isAuthLoading ? null : isLoggedIn ? (
            <Link
              href="/student/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
            >
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {avatarImage ? (
                  <img src={avatarImage} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 text-base leading-tight">
                  {displayName}
                </p>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                  Student
                </p>
              </div>
            </Link>
          ) : (
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="w-full block bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md shadow-blue-500/20 transition font-bold min-w-[120px] text-center"
            >
              Get Started
            </Link>
          )}
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
