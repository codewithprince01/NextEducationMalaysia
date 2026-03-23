'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

type PageToken = number | 'dots'

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const chunkSize = 10
  const chunkStart = Math.floor((currentPage - 1) / chunkSize) * chunkSize + 1
  const chunkEnd = Math.min(chunkStart + chunkSize - 1, totalPages)
  const tokens: PageToken[] = []

  if (chunkStart > 1) {
    tokens.push(1)
    if (chunkStart > 2) tokens.push('dots')
  }

  for (let page = chunkStart; page <= chunkEnd; page += 1) {
    tokens.push(page)
  }

  if (chunkEnd < totalPages) {
    if (chunkEnd < totalPages - 1) tokens.push('dots')
    tokens.push(totalPages)
  }

  return tokens
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const tokens = buildPageTokens(currentPage, totalPages)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <nav aria-label="Pagination" className={className}>
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            aria-label="Previous page"
            className={`h-10 w-10 rounded-xl border transition-all ${
              canGoPrev
                ? 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            <ChevronLeft className="mx-auto h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {tokens.map((token, index) => {
              if (token === 'dots') {
                return (
                  <span key={`dots-${index}`} className="px-2 text-sm font-semibold tracking-wide text-slate-400">
                    ...
                  </span>
                )
              }

              const page = token
              const active = page === currentPage
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  aria-current={active ? 'page' : undefined}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-transparent bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
            className={`h-10 w-10 rounded-xl border transition-all ${
              canGoNext
                ? 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            <ChevronRight className="mx-auto h-4 w-4" />
          </button>
        </div>

      </div>
    </nav>
  )
}
