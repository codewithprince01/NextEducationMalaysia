import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items, className = "" }: { items: BreadcrumbItem[], className?: string }) {
  if (!items || items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`w-full bg-[#f0f7ff] border-b border-blue-100/50 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm font-medium text-gray-500 flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isHome = index === 0;

            return (
              <li key={item.label} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />
                )}
                {isLast ? (
                  <span
                    className="text-blue-600 font-semibold truncate max-w-[200px] sm:max-w-none"
                    aria-current="page"
                  >
                    {isHome && <Home className="w-4 h-4 mr-1 inline" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="hover:text-blue-500 transition-colors flex items-center whitespace-nowrap"
                  >
                    {isHome && (
                      <Home className="w-4 h-4 mr-1 inline text-gray-400" />
                    )}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  )
}
