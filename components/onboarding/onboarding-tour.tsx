'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import './onboarding.css'

export type OnboardingStep = { target: string; title: string; description: string }

type Props = { tourId: string; steps: OnboardingStep[]; open?: boolean; onClose?: () => void }

function storageKey(tourId: string, state: 'completed' | 'skipped') { return `avinova_tour_${tourId}_${state}` }

export function OnboardingTour({ tourId, steps, open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const currentStep = steps[index]

  const finish = useCallback((state: 'completed' | 'skipped') => {
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey(tourId, state), 'true')
    setActive(false)
    onClose?.()
    previousFocus.current?.focus()
  }, [onClose, tourId])

  const start = useCallback(() => {
    if (!steps.length) return
    previousFocus.current = document.activeElement as HTMLElement
    setIndex(0)
    setActive(true)
  }, [steps.length])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && !localStorage.getItem(storageKey(tourId, 'completed')) && !localStorage.getItem(storageKey(tourId, 'skipped'))) {
      const timer = window.setTimeout(start, 700)
      return () => window.clearTimeout(timer)
    }
  }, [start, tourId])

  useEffect(() => { if (open && mounted) start() }, [mounted, open, start])

  useEffect(() => {
    if (!active || !currentStep) return
    const update = () => {
      const element = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`)
      if (!element) { console.warn(`[Avinova tour] Missing target: ${currentStep.target}`); setRect(null); return }
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      setRect(element.getBoundingClientRect())
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [active, currentStep])

  useEffect(() => {
    if (!active) return
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') finish('skipped') }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, finish])

  if (!mounted || !active || !currentStep) return null
  const next = () => index === steps.length - 1 ? finish('completed') : setIndex((value) => value + 1)
  const highlightStyle = rect ? { top: Math.max(8, rect.top - 6), left: Math.max(8, rect.left - 6), width: rect.width + 12, height: rect.height + 12 } : undefined
  const cardStyle = rect ? { top: Math.min(window.innerHeight - 270, Math.max(16, rect.bottom + 18)), left: Math.min(window.innerWidth - 360, Math.max(16, rect.left)) } : undefined

  return <div className="onboarding-tour" role="presentation"><div className="onboarding-backdrop" onClick={() => finish('skipped')} /><div className="onboarding-highlight" style={highlightStyle} aria-hidden="true" /><div className={`onboarding-card${rect ? '' : ' onboarding-card-centered'}`} ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description"><button className="onboarding-close" type="button" onClick={() => finish('skipped')} aria-label="Cerrar tutorial">×</button><span className="onboarding-step">Paso {index + 1} de {steps.length}</span><h2 id="onboarding-title">{currentStep.title}</h2><p id="onboarding-description">{currentStep.description}</p><div className="onboarding-progress" aria-hidden="true">{steps.map((_, step) => <span key={step} className={step === index ? 'is-active' : ''} />)}</div><div className="onboarding-actions"><button type="button" className="onboarding-skip" onClick={() => finish('skipped')}>Omitir tutorial</button><div className="onboarding-navigation">{index > 0 && <button type="button" className="onboarding-secondary" onClick={() => setIndex((value) => value - 1)}>Anterior</button>}<button type="button" className="onboarding-primary" onClick={next}>{index === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button></div></div></div></div>
}

export function useOnboarding(tourId: string, steps: OnboardingStep[]) { const [open, setOpen] = useState(false); return { open, steps, show: () => setOpen(true), close: () => setOpen(false), tour: <OnboardingTour tourId={tourId} steps={steps} open={open} onClose={() => setOpen(false)} /> } }

export function OnboardingHelpButton({ onClick }: { onClick: () => void }) { return <button type="button" className="onboarding-help" onClick={onClick} aria-label="Ver tutorial de esta página">Ayuda</button> }

export function resetOnboarding(tourId: string) { if (typeof window !== 'undefined') { localStorage.removeItem(storageKey(tourId, 'completed')); localStorage.removeItem(storageKey(tourId, 'skipped')) } }

export type { Props as OnboardingTourProps }

export default OnboardingTour
