'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function UniversityScrollTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstMountRef = useRef(true)
  const prevPathnameRef = useRef<string | null>(null)
  const prevSearchRef = useRef<string | null>(null)

  useEffect(() => {
    // If there is a hash target in the URL (e.g. #overview-section), let hash scroll handle it
    if (typeof window !== 'undefined' && window.location.hash) {
      return
    }

    const searchStr = searchParams ? searchParams.toString() : ''
    const isTabContentRoute = /^\/university\/[^/]+\/(courses|gallery|videos|ranking|reviews)(\/.*)?$/.test(pathname)
    const isInitialMount = isFirstMountRef.current
    isFirstMountRef.current = false

    const hasPathnameChanged = prevPathnameRef.current !== null && prevPathnameRef.current !== pathname
    const hasSearchChanged = prevSearchRef.current !== null && prevSearchRef.current !== searchStr

    prevPathnameRef.current = pathname
    prevSearchRef.current = searchStr

    // If not initial mount and neither path nor search params changed, skip
    if (!isInitialMount && !hasPathnameChanged && !hasSearchChanged) {
      return
    }

    const scrollToTabs = (smooth = true) => {
      if (isTabContentRoute) {
        const tabs = document.getElementById('university-tabs')
        if (tabs) {
          const nav = document.querySelector('nav')
          const navHeight = nav ? nav.getBoundingClientRect().height : 76
          const y = tabs.getBoundingClientRect().top + window.scrollY - navHeight
          window.scrollTo({
            top: Math.max(0, y),
            left: 0,
            behavior: smooth ? 'smooth' : 'auto',
          })
          return true
        }
      } else if (!isInitialMount && hasPathnameChanged) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        return true
      }
      return false
    }

    if (isTabContentRoute) {
      // Immediate attempt
      scrollToTabs(false)

      // Timed attempts after hero banner, fonts, and images layout settle
      const t1 = setTimeout(() => scrollToTabs(true), 100)
      const t2 = setTimeout(() => scrollToTabs(true), 300)
      const t3 = setTimeout(() => scrollToTabs(true), 600)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
  }, [pathname, searchParams])

  return null
}
