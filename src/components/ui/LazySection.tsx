'use client'

import { useEffect, useRef, useState, useCallback, startTransition } from 'react'

interface LazySectionProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export default function LazySection({ 
  children, 
  placeholder,
  rootMargin = "600px 0px",  // Increased from 300px: start loading 600px before viewport
  threshold = 0
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const idleCallbackRef = useRef<number | null>(null)

  const reveal = useCallback(() => {
    // startTransition marks this as non-urgent — React can yield to the browser
    // between section mounts, breaking the monolithic hydration long task into
    // smaller 50ms-or-less slices, directly reducing TBT
    startTransition(() => {
      setIsVisible(true)
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Use requestIdleCallback when available — lets browser load chunk
          // during idle time before the section is fully in view, reducing
          // perceived jank without blocking LCP or TBT
          if ('requestIdleCallback' in window) {
            idleCallbackRef.current = (window as any).requestIdleCallback(reveal, { timeout: 400 })
          } else {
            reveal()
          }
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
      if (idleCallbackRef.current !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallbackRef.current)
      }
    }
  }, [threshold, rootMargin, reveal])

  return (
    <div ref={ref}>
      {isVisible ? children : (placeholder ?? null)}
    </div>
  )
}
