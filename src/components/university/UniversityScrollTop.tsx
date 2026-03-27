'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function UniversityScrollTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
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
  }, [pathname, searchParams])

  return null
}
