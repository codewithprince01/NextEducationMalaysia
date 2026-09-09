'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { LOGIN_ROUTE } from '@/lib/auth/session'
import AuthSplash from './AuthSplash'
import SessionError from './SessionError'

/**
 * Wraps pages that require a signed-in student. Visitors whose session expired
 * are sent to the login page with `?next=` so they land back where they aimed;
 * someone who signed out on purpose just gets a clean `/login`.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, signedOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status !== 'anonymous') return

    if (signedOut) {
      router.replace(LOGIN_ROUTE)
      return
    }

    const query = searchParams.toString()
    const target = `${pathname || '/'}${query ? `?${query}` : ''}`
    router.replace(`${LOGIN_ROUTE}?next=${encodeURIComponent(target)}`)
  }, [status, signedOut, pathname, router, searchParams])

  if (status === 'error') return <SessionError />
  if (status === 'resolving') return <AuthSplash label="Checking your session…" />
  if (status === 'anonymous') return <AuthSplash label={signedOut ? 'Signing you out…' : 'Redirecting to login…'} />


  return <>{children}</>
}
