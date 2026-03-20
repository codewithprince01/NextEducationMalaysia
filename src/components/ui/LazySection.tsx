'use client'

import { useEffect, useRef, useState } from 'react'

interface LazySectionProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export default function LazySection({ 
  children, 
  placeholder = <div style={{ minHeight: 320 }} className="bg-slate-50" />,
  rootMargin = "150px 0px",
  threshold = 0.1
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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
    }
  }, [threshold, rootMargin])

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  )
}
