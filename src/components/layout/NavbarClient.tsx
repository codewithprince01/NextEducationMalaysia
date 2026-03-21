'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

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
    { href: '/resources/guidelines/MQA', label: 'MQA' },
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
  const { isAuthenticated: isLoggedIn } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className="px-4 sm:px-8 fixed top-0 left-0 right-0 z-[9999] h-[56px] flex items-center bg-white/95 backdrop-blur text-black shadow-lg">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" aria-label="Home" className="overflow-hidden flex items-center h-[56px] shrink-0">
            <Image
              src="/logo.png"
              alt="Education Malaysia Logo"
              width={200}
              height={36}
              priority
              className="h-9 sm:h-10 w-auto max-w-[220px] object-contain"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-7 font-medium">
            <Link
              href="/"
              className={`hover:text-blue-700 transition ${
                isActive('/') ? 'text-blue-900 font-bold underline underline-offset-8' : ''
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
                className="flex items-center gap-1 hover:text-blue-700"
              >
                Resources
                <FaChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} size={13} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[750px] z-50">
                  <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-blue-50 p-8 grid grid-cols-4 gap-6 relative">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-blue-50" />

                    <div className="col-span-4 mb-2 flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-xl font-bold text-gray-900">Resources Hub</h3>
                      <Link href="/resources" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center text-sm">
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
                        <Link href={group.href} className="font-bold text-blue-600 mb-3 hover:underline block">
                          {group.title}
                        </Link>
                        <ul className="space-y-2 text-sm">
                          {group.items.map(item => (
                            <li key={item.href}>
                              <Link href={item.href} className="hover:underline">{item.label}</Link>
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
                className={`hover:text-blue-700 transition ${
                  isActive(link.href) ? 'text-blue-900 font-bold underline underline-offset-8' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* CTA */}
            <Link href={isLoggedIn ? '/student/profile' : '/signup'}>
              <button className="bg-blue-900 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold">
                {isLoggedIn ? 'Profile' : 'Get Started'}
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-blue-900 text-2xl z-60"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-[9998] transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-4 font-medium overflow-y-auto h-full pt-20">
          <div className="absolute top-4 right-4">
            <button onClick={() => setMenuOpen(false)} className="text-blue-900 text-3xl" aria-label="Close menu">
              <FaTimes />
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
              Resources <FaChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} size={15} />
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

          <Link href={isLoggedIn ? '/student/profile' : '/signup'} className="w-full block">
            <button className="w-full bg-blue-900 text-white py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold">
              {isLoggedIn ? 'Profile' : 'Get Started'}
            </button>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9997] md:hidden"
          onClick={() => setMenuOpen(false)}
          role="button"
          aria-label="Close menu overlay"
        />
      )}
    </>
  )
}
