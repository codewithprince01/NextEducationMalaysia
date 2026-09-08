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

    const segments = pathname.split('/').filter(Boolean)
    // /university/[slug] -> segments: ['university', 'slug'] (length <= 2)
    // /university/[slug]/courses, /university/[slug]/gallery, /university/[slug]/courses/[courseSlug] -> length > 2
    const isBaseOverview = segments.length <= 2 && segments[0] === 'university'

    const scrollToPosition = () => {
      if (typeof window === 'undefined') return

      if (isBaseOverview) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
        if (document.documentElement) document.documentElement.scrollTop = 0
        if (document.body) document.body.scrollTop = 0
      } else {
        const tabs = document.getElementById('university-tabs')
        if (tabs) {
          const nav = document.querySelector('nav') || document.querySelector('header')
          const navHeight = nav ? nav.getBoundingClientRect().height : 76
          const y = tabs.getBoundingClientRect().top + window.scrollY - navHeight
          window.scrollTo({ top: Math.max(0, y), behavior: 'instant' as ScrollBehavior })
          if (document.documentElement) document.documentElement.scrollTop = Math.max(0, y)
          if (document.body) document.body.scrollTop = Math.max(0, y)
        }
      }
    }

    scrollToPosition()
    const rAf = requestAnimationFrame(scrollToPosition)
    const t1 = setTimeout(scrollToPosition, 50)
    const t2 = setTimeout(scrollToPosition, 150)
    const t3 = setTimeout(scrollToPosition, 300)
    const t4 = setTimeout(scrollToPosition, 600)
    const t5 = setTimeout(scrollToPosition, 1000)

    window.addEventListener('load', scrollToPosition)

    return () => {
      cancelAnimationFrame(rAf)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      window.removeEventListener('load', scrollToPosition)
    }
  }, [pathname])

  return null
}


