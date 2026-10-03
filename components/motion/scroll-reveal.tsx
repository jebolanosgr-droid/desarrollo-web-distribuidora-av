'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function MotionObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.motion-reveal:not(.is-visible)'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.18 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return null
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.18 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`motion-reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ '--motion-delay': `${delay}ms` } as CSSProperties}>{children}</div>
}
