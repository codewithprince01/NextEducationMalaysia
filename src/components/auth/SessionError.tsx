'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

/**
 * Shown when the browser holds a refresh cookie but the API could not be
 * reached (offline, 5xx, rate limited). We deliberately do NOT redirect here:
 * middleware trusts the cookie, so an automatic bounce to /login would be sent
 * straight back and loop. The visitor retries or signs out explicitly instead.
 */
export default function SessionError() {
  const { refreshSession, logout } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const retry = async () => {
    setBusy(true)
    await refreshSession()
    setBusy(false)
  }

  const signOut = async () => {
    setBusy(true)
    await logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center border border-slate-200/80 rounded-2xl p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">We couldn&apos;t verify your session</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your connection to our servers failed. Your account is fine — please try again.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={retry}
            disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Checking…' : 'Try again'}
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition disabled:opacity-60 cursor-pointer"
          >
            Sign in again
          </button>
        </div>
      </div>
    </div>
  )
}
