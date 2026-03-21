'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function UniversityScrollTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, searchParams])

  return null
}
