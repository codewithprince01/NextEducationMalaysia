'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DEFAULT_AUTHENTICATED_ROUTE, sanitizeRedirect } from '@/lib/auth/session'
import AuthSplash from './AuthSplash'

/**
 * Wraps pages that only make sense when signed out (login, signup).
 * A signed-in student is sent to `?next=` when present, otherwise the dashboard,
 * and never sees the form flash on screen first.
 */
export default function GuestOnly({
  children,
  redirectTo = DEFAULT_AUTHENTICATED_ROUTE,
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const { status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeRedirect(searchParams.get('next'))

  useEffect(() => {
    if (status !== 'authenticated') return
    router.replace(next || redirectTo)
  }, [status, next, redirectTo, router])

  if (status === 'resolving') return <AuthSplash />
  if (status === 'authenticated') return <AuthSplash label="Taking you to your dashboard…" />

  // `error` falls through to the form: signing in again is the way out.
  return <>{children}</>
}
