'use client'

import { useEffect } from 'react'

type Props = {
  open: boolean
  message: string
  onClose: () => void
  autoCloseMs?: number
}

export default function FormSuccessPopup({
  open,
  message,
  onClose,
  autoCloseMs = 2300,
}: Props) {
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => onClose(), autoCloseMs)
    return () => window.clearTimeout(t)
  }, [open, onClose, autoCloseMs])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-5 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[18px] leading-7 font-semibold text-[#0b1b45]">{message}</p>
      </div>
    </div>
  )
}

