'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  AUTH_EVENT,
  clearSession,
  ensureSessionHint,
  hasSessionHint,
  readSession,
  saveSession,
  type StoredSession,
} from '@/lib/auth/session'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface AuthUser {
  id: string
  email: string | null
  name: string
}

/**
 * `resolving` → still reading storage / refreshing.
 * `authenticated` / `anonymous` → settled, guards may redirect.
 * `error`  → the browser still holds a refresh cookie but we could not reach the
 *            API (offline, 5xx, rate limited). Guards must NOT redirect on this,
 *            otherwise middleware (which trusts the cookie) and the client would
 *            bounce the visitor back and forth forever.
 */
type SessionStatus = 'resolving' | 'authenticated' | 'anonymous' | 'error'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  status: SessionStatus
  user: AuthUser | null
  token: string | null
  login: (token: string, studentId: string, email: string, name?: string) => void
  /**
   * `reason` defaults to `'user'` (they clicked sign out). Pass `'expired'` when
   * the session died on its own, so guards keep the `?next=` return path.
   */
  logout: (reason?: 'user' | 'expired') => Promise<void>
  /**
   * True when the student signed out on purpose (rather than being bounced by an
   * expired session). Guards use this to send them to a clean `/login` instead of
   * `/login?next=<the page they just left>`.
   */
  signedOut: boolean
  /** Exchange the httpOnly refresh cookie for a fresh access token. */
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const toUser = (session: StoredSession): AuthUser => ({
  id: session.id,
  email: session.email,
  name: session.name,
})

interface AuthState {
  status: SessionStatus
  user: AuthUser | null
  token: string | null
  /** Set only by an explicit sign-out; cleared as soon as a session exists again. */
  signedOut: boolean
}

const ANONYMOUS: AuthState = { status: 'anonymous', user: null, token: null, signedOut: false }
const SIGNED_OUT: AuthState = { ...ANONYMOUS, signedOut: true }

export function AuthProvider({
  children,
  /**
   * Whether the request carried the session hint cookie. Passed from the root
   * layout so an anonymous visitor's first paint is the real page rather than a
   * spinner. When the hint is present we stay unresolved until the client has
   * read storage (or refreshed), which keeps server and client HTML identical.
   */
  initialHasSession = true,
}: {
  children: React.ReactNode
  initialHasSession?: boolean
}) {
  const [state, setState] = useState<AuthState>(
    initialHasSession ? { status: 'resolving', user: null, token: null, signedOut: false } : ANONYMOUS
  )

  const refreshInFlight = useRef<Promise<boolean> | null>(null)

  const applySession = useCallback((session: StoredSession | null) => {
    setState(
      session
        ? { status: 'authenticated', user: toUser(session), token: session.token, signedOut: false }
        : ANONYMOUS
    )
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (refreshInFlight.current) return refreshInFlight.current

    const attempt = (async () => {
      try {
        const response = await fetch(`${API_BASE}/student/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
          },
        })

        const body = await response.json().catch(() => ({}))
        const data = body?.data || body

        if (response.ok && data?.token) {
          applySession(
            saveSession({
              token: data.token,
              id: data.id ?? data.student?.id,
              email: data.email ?? data.student?.email,
              name: data.name ?? data.student?.name,
            })
          )
          return true
        }

        if (response.status === 401 || response.status === 403) {
          // The refresh cookie is dead and the API already cleared it.
          clearSession()
          setState(ANONYMOUS)
        } else {
          // Transient: keep the cookie so a retry can still succeed.
          setState({ status: 'error', user: null, token: null, signedOut: false })
        }
        return false
      } catch {
        setState({ status: 'error', user: null, token: null, signedOut: false })
        return false
      } finally {
        refreshInFlight.current = null
      }
    })()

    refreshInFlight.current = attempt
    return attempt
  }, [applySession])

  // Resolve the session once, on mount.
  useEffect(() => {
    const stored = readSession()

    if (stored) {
      // Heal sessions created before the routing hint cookie existed.
      ensureSessionHint()
      applySession(stored)
      return
    }

    if (!hasSessionHint()) {
      setState(ANONYMOUS)
      return
    }

    // No access token but the browser still holds a refresh cookie — sign the
    // student back in silently instead of showing them the login form again.
    void refreshSession()
  }, [applySession, refreshSession])

  // Keep every tab, modal and form that touches the session in sync.
  useEffect(() => {
    const sync = () => {
      const stored = readSession()
      if (stored) {
        applySession(stored)
      } else if (!hasSessionHint()) {
        // Keep an in-progress sign-out flagged: this listener also fires from
        // clearSession() inside logout(), and losing the flag here would put the
        // `?next=` back on the login URL.
        setState((prev) => (prev.signedOut ? prev : ANONYMOUS))
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'token' || event.key === 'student_id') sync()
    }

    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [applySession])

  const login = useCallback(
    (token: string, studentId: string, email: string, name?: string) => {
      applySession(saveSession({ token, id: studentId, email, name }))
    },
    [applySession]
  )

  const logout = useCallback(async (reason: 'user' | 'expired' = 'user') => {
    try {
      await fetch(`${API_BASE}/student/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
      })
    } catch {
      // Revoking server-side is best effort; the local session goes either way.
    } finally {
      clearSession()
      setState(reason === 'user' ? SIGNED_OUT : ANONYMOUS)
    }
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: state.status === 'authenticated',
      isLoading: state.status === 'resolving',
      status: state.status,
      user: state.user,
      token: state.token,
      signedOut: state.signedOut,
      login,
      logout,
      refreshSession,
    }),
    [state, login, logout, refreshSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
