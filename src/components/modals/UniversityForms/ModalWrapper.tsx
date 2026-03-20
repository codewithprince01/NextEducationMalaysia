'use client'

import React, { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}

export default function ModalWrapper({ open, onClose, children, wide = false }: Props) {
  useEffect(() => {
    if (open) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollBarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative z-10 bg-white rounded-2xl shadow-2xl ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-6 pt-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
