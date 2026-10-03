'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

const observerOptions: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: '0px 0px -10% 0px',
}

function revealImmediately(element: HTMLElement) {
  element.classList.add('motion-reveal-visible')
  element.classList.remove('motion-reveal-ready')
}

export function MotionObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.motion-reveal:not(.motion-reveal-visible):not(.is-visible)'))
    if (!elements.length) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(revealImmediately)
      return
    }

    elements.forEach((element) => element.classList.add('motion-reveal-ready'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealImmediately(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return null
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    setReady(true)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.unobserve(element)
      }
    }, observerOptions)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`motion-reveal ${ready ? 'motion-reveal-ready' : ''} ${visible ? 'motion-reveal-visible' : ''} ${className}`} style={{ '--motion-delay': `${delay}ms` } as CSSProperties}>{children}</div>
}
