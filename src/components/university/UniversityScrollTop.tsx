'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function UniversityScrollTop() {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    // If pathname didn't change (e.g. hash navigation, search param or state update on the same page), DO NOT scroll!
    if (prevPathnameRef.current === pathname) {
      return
    }
    prevPathnameRef.current = pathname

    // If there is a hash target in the URL, let hash scroll handle it
    if (typeof window !== 'undefined' && window.location.hash) {
      return
    }

    const id = requestAnimationFrame(() => {
      const isTabContentRoute = /^\/university\/[^/]+\/(courses|gallery|videos|ranking|reviews)(\/.*)?$/.test(pathname)

      if (isTabContentRoute) {
        const tabs = document.getElementById('university-tabs')
        if (tabs) {
          const y = tabs.getBoundingClientRect().top + window.scrollY - 56
          window.scrollTo({ top: Math.max(0, y), left: 0, behavior: 'auto' })
          return
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
