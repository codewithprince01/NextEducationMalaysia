/**
 * Single source of truth for the browser-side student session.
 *
 * The access token lives in localStorage (used as a Bearer token by every
 * dashboard fetch). The refresh token lives in an httpOnly cookie that only
 * the API routes can read. Because middleware cannot see localStorage, the API
 * also drops a small, client-readable "hint" cookie (`em_session`) next to the
 * refresh cookie so the server can tell — before any JS runs — that this
 * browser probably has a session. The hint is never trusted for authorization,
 * only for routing.
 */

export const AUTH_EVENT = 'em-auth-changed'
export const SESSION_HINT_COOKIE = 'em_session'

const HINT_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

export interface StoredSession {
  token: string
  id: string
  email: string | null
  name: string
}

const isBrowser = () => typeof window !== 'undefined'

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage disabled (private mode / blocked cookies) */
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Read the persisted session, or null when this browser is not signed in. */
export function readSession(): StoredSession | null {
  if (!isBrowser()) return null

  const token = safeGet('token')
  const id = safeGet('student_id')
  if (!token || !id) return null

  return {
    token,
    id,
    email: safeGet('student_email'),
    name: (safeGet('student_name') || '').trim(),
  }
}

export function getAccessToken(): string | null {
  return readSession()?.token ?? null
}

export function hasSessionHint(): boolean {
  if (!isBrowser()) return false
  return document.cookie
    .split(';')
    .some((part) => part.trim().startsWith(`${SESSION_HINT_COOKIE}=1`))
}

/**
 * Re-assert the hint cookie for browsers that signed in before the cookie
 * existed, so middleware and the client agree on the same session state.
 */
export function ensureSessionHint(): void {
  if (!isBrowser() || hasSessionHint()) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/; Max-Age=${HINT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

export function clearSessionHint(): void {
  if (!isBrowser()) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
}

/** Persist a freshly issued session and notify every listener in this tab. */
export function saveSession(input: {
  token: string
  id: string | number
  email?: string | null
  name?: string | null
}): StoredSession {
  const session: StoredSession = {
    token: input.token,
    id: String(input.id),
    email: input.email ? String(input.email) : null,
    name: (input.name ? String(input.name) : '').trim(),
  }

  if (isBrowser()) {
    safeSet('token', session.token)
    safeSet('student_id', session.id)
    if (session.email) safeSet('student_email', session.email)
    if (session.name) safeSet('student_name', session.name)
    ensureSessionHint()
    notifyAuthChanged()
  }

  return session
}

/** Wipe every trace of the session, including the routing hint. */
export function clearSession(): void {
  if (!isBrowser()) return
  safeRemove('token')
  safeRemove('student_id')
  safeRemove('student_email')
  safeRemove('student_name')
  clearSessionHint()
  notifyAuthChanged()
}

/** Same-tab broadcast (the `storage` event only fires in *other* tabs). */
export function notifyAuthChanged(): void {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(AUTH_EVENT))
}

/** `next` is attacker-controllable, so only same-site absolute paths pass. */
export function sanitizeRedirect(value: string | null | undefined): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  if (value.startsWith('/login') || value.startsWith('/signup')) return null
  return value
}

export const DEFAULT_AUTHENTICATED_ROUTE = '/student/overview'
export const LOGIN_ROUTE = '/login'
