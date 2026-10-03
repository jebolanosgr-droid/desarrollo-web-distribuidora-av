'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import './onboarding.css'

export type OnboardingStep = { target: string; title: string; description: string }
type Props = { tourId: string; steps: OnboardingStep[]; open?: boolean; onClose?: () => void }
const key = (id: string, state: 'completed' | 'skipped') => `avinova_tour_${id}_${state}`

export function OnboardingTour({ tourId, steps, open = false, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const step = steps[index]
  const close = useCallback((state: 'completed' | 'skipped') => { window.localStorage.setItem(key(tourId, state), 'true'); setActive(false); onClose?.(); previousFocus.current?.focus() }, [onClose, tourId])
  const start = useCallback(() => { if (!steps.length) return; previousFocus.current = document.activeElement as HTMLElement; setIndex(0); setActive(true) }, [steps.length])
  useEffect(() => { setMounted(true); const timer = window.setTimeout(() => { if (!localStorage.getItem(key(tourId, 'completed')) && !localStorage.getItem(key(tourId, 'skipped'))) start() }, 700); return () => window.clearTimeout(timer) }, [start, tourId])
  useEffect(() => { if (open && mounted) start() }, [mounted, open, start])
  useEffect(() => { if (!active || !step) return; let frame = 0; const update = () => { const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`); if (!el) { console.warn(`[Avinova tour] Missing target: ${step.target}`); setRect(null); return }; el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }); frame = requestAnimationFrame(() => setRect(el.getBoundingClientRect())) }; update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true); return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) } }, [active, step])
  useEffect(() => { if (!active) return; dialogRef.current?.focus(); const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') close('skipped') }; document.addEventListener('keydown', handler); return () => document.removeEventListener('keydown', handler) }, [active, close])
  if (!mounted || !active || !step) return null
  const next = () => index === steps.length - 1 ? close('completed') : setIndex((value) => value + 1)
  const highlight = rect ? { top: Math.max(8, rect.top - 6), left: Math.max(8, rect.left - 6), width: rect.width + 12, height: rect.height + 12 } : undefined
  const card = rect ? { top: Math.min(window.innerHeight - 330, Math.max(16, rect.bottom + 18)), left: Math.min(window.innerWidth - 396, Math.max(16, rect.left)) } : undefined
  return <div className="onboarding-tour"><div className="onboarding-backdrop" /><div className="onboarding-highlight" style={highlight} aria-hidden="true" /><div className={`onboarding-card${rect ? '' : ' onboarding-card-centered'}`} style={card} ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description"><button className="onboarding-close" type="button" onClick={() => close('skipped')} aria-label="Cerrar tutorial">×</button><span className="onboarding-step">Paso {index + 1} de {steps.length}</span><h2 id="onboarding-title">{step.title}</h2><p id="onboarding-description">{step.description}</p><div className="onboarding-progress" aria-hidden="true">{steps.map((item, itemIndex) => <span key={`${item.target}-${itemIndex}`} className={itemIndex === index ? 'is-active' : ''} />)}</div><div className="onboarding-actions"><button className="onboarding-skip" type="button" onClick={() => close('skipped')}>Omitir tutorial</button><div className="onboarding-navigation">{index > 0 && <button className="onboarding-secondary" type="button" onClick={() => setIndex((value) => value - 1)}>Anterior</button>}<button className="onboarding-primary" type="button" onClick={next}>{index === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button></div></div></div></div>
}

export function OnboardingHelpButton({ onClick }: { onClick: () => void }) { return <button className="onboarding-help" type="button" onClick={onClick} aria-label="Ver tutorial de esta página">Ayuda</button> }
export function resetOnboarding(tourId: string) { if (typeof window !== 'undefined') { localStorage.removeItem(key(tourId, 'completed')); localStorage.removeItem(key(tourId, 'skipped')) } }
export default OnboardingTour
