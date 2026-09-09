'use client'

/** Neutral placeholder shown while the session is being resolved or a guard redirects. */
export default function AuthSplash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 bg-white">
      <div className="w-9 h-9 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}
