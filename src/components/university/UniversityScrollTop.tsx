'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function UniversityScrollTop() {
  const pathname = usePathname()

  useEffect(() => {
    // If there is a hash target in the URL, let hash scroll handle it
    if (typeof window !== 'undefined' && window.location.hash) {
      return
    }

    // Scroll to the very top (Hero Banner & Breadcrumbs)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, 60)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
