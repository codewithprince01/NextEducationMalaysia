'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// Lazy-load the modal — it only appears 5s after page load, no need in initial bundle
const MalaysiaCallingPopup = dynamic(() => import('@/components/modals/MalaysiaCallingPopup'))

const MAX_DISMISSALS = 1
const POPUP_DELAY_MS = 5000

const EXCLUDED_PREFIXES = ['/student', '/login', '/signup', '/confirmed-email', '/account/password/reset']

export default function MalaysiaCallingAutoPopup() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const shownOnPath = useRef<string>('')

  useEffect(() => {
    const shouldExclude = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))
    if (shouldExclude) return

    if (typeof window === 'undefined') return
    if (localStorage.getItem('scholarshipFormSubmitted') === 'true') return

    const dismissals = Number.parseInt(localStorage.getItem('popupDismissCount') || '0', 10)
    if (dismissals >= MAX_DISMISSALS) return
    if (shownOnPath.current === pathname) return

    const timer = window.setTimeout(() => {
      if (localStorage.getItem('scholarshipFormSubmitted') === 'true') return
      shownOnPath.current = pathname
      setOpen(true)
    }, POPUP_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [pathname])

  const handleClose = () => {
    setOpen(false)
    if (typeof window === 'undefined') return
    if (localStorage.getItem('scholarshipFormSubmitted') === 'true') return
    const current = Number.parseInt(localStorage.getItem('popupDismissCount') || '0', 10)
    localStorage.setItem('popupDismissCount', String(current + 1))
  }

  return <MalaysiaCallingPopup isOpen={open} onClose={handleClose} />
}

