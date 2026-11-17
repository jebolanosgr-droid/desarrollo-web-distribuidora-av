'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

type Availability = {
  id: number
  weekStart: string
  totalBoxes: number
  maleBoxes: number
  femaleBoxes: number
  opensAt: string | null
  closesAt: string | null
  manualClosed: boolean
  reservedBoxes: number
  remainingBoxes: number
  reservedMaleBoxes: number
  remainingMaleBoxes: number
  reservedFemaleBoxes: number
  remainingFemaleBoxes: number
}

type AvailabilityResponse = { availability: Availability[] }
const EMPTY_AVAILABILITY: Availability[] = []

function addDays(value: string, days: number) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function isMonday(value: string) {
  return Boolean(value) && new Date(`${value}T12:00:00.000Z`).getUTCDay() === 1
}

function fetchAvailability(url: string): Promise<AvailabilityResponse> {
  return fetch(url).then(async (response) => {
    if (!response.ok) throw new Error('availability')
    return response.json()
  })
}

export function DashboardAvailabilityManager() {
  const { data, error, isLoading, mutate } = useSWR<AvailabilityResponse>('/api/availability', fetchAvailability, { revalidateOnFocus: true })
  const availability = data?.availability ?? EMPTY_AVAILABILITY
  const [week, setWeek] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [boxes, setBoxes] = useState('')
  const [maleBoxes, setMaleBoxes] = useState('')
  const [femaleBoxes, setFemaleBoxes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const selected = availability.find((item) => item.weekStart === week)

  useEffect(() => {
    if (week || availability.length === 0) return
    const first = availability[0]
    setWeek(first.weekStart)
    setWeekEnd(addDays(first.weekStart, 6))
    setBoxes(String(first.totalBoxes))
    setMaleBoxes(String(first.maleBoxes))
    setFemaleBoxes(String(first.femaleBoxes))
  }, [availability, week])

  function selectWeek(value: string) {
    const saved = availability.find((item) => item.weekStart === value)
    setWeek(value)
    setWeekEnd(addDays(value, 6))
    setBoxes(saved ? String(saved.totalBoxes) : '')
    setMaleBoxes(saved ? String(saved.maleBoxes) : '')
    setFemaleBoxes(saved ? String(saved.femaleBoxes) : '')
    setMessage('')
  }

  const total = Number(boxes)
  const maleLimit = maleBoxes === '' ? total : Number(maleBoxes)
  const femaleLimit = femaleBoxes === '' ? total : Number(femaleBoxes)
  const validForm = Boolean(
    isMonday(week) && weekEnd === addDays(week, 6) &&
    Number.isInteger(total) && total >= 1 && total <= 10_000 &&
    Number.isInteger(maleLimit) && maleLimit >= 0 && maleLimit <= total &&
    Number.isInteger(femaleLimit) && femaleLimit >= 0 && femaleLimit <= total,
  )
  const currentTime = Date.now()
  const scheduleClosed = Boolean(
    selected?.opensAt && new Date(selected.opensAt).getTime() > currentTime ||
    selected?.closesAt && new Date(selected.closesAt).getTime() < currentTime,
  )
  const isEnabled = Boolean(selected && !selected.manualClosed && !scheduleClosed)

  async function saveAvailability(manualClosed: boolean) {
    if (!validForm) {
      setMessage('Elige un lunes e introduce límites válidos para el total y cada género.')
      return
    }
    if (manualClosed && !selected) {
      setMessage('Guarda primero la disponibilidad de esta semana antes de cerrarla.')
      return
    }
    if (manualClosed && !window.confirm('¿Deseas cerrar las reservas para esta semana? Las reservas existentes se conservan.')) return

    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: week,
          totalBoxes: total,
          maleBoxes: maleLimit,
          femaleBoxes: femaleLimit,
          opensAt: selected?.opensAt ?? null,
          closesAt: selected?.closesAt ?? null,
          manualClosed,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(result?.error ?? 'No se pudo guardar la disponibilidad.')
        return
      }
      await mutate(result, { revalidate: false })
      setMessage(manualClosed ? 'Las reservas de esta semana quedaron cerradas.' : 'La disponibilidad quedó guardada en la base de datos.')
    } catch {
      setMessage('No se pudo conectar con la disponibilidad. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const weekLabel = week && weekEnd ? `${week} — ${weekEnd}` : 'Sin semana seleccionada'

  return (
    <section className="admin-dashboard-control" aria-labelledby="enable-title">
      <div className="admin-dashboard-fields">
        <h2 id="enable-title">Habilitar reserva</h2>
        {isLoading && <p role="status">Consultando disponibilidad guardada…</p>}
        {error && <p className="admin-feedback" role="alert">No se pudo consultar la disponibilidad. Revisa el estado de la migración en Render.</p>}
        <div className="admin-dashboard-grid">
          <label htmlFor="admin-week"><span className="admin-field-heading"><span aria-hidden="true">▣</span> Disponibilidad de cajas</span><b>Semana (lunes):</b><input id="admin-week" type="date" value={week} onChange={(event) => selectWeek(event.target.value)} /></label>
          <label htmlFor="admin-week-end"><span className="admin-field-heading"><span aria-hidden="true">▣</span> Finalización de disponibilidad</span><b>Hasta:</b><input id="admin-week-end" type="date" value={weekEnd} readOnly aria-readonly="true" /></label>
          <label htmlFor="admin-boxes"><span className="admin-field-heading"><span aria-hidden="true">◇</span> Número de cajas a habilitar</span><b>Total de cajas:</b><input id="admin-boxes" type="number" min="1" max="10000" step="1" value={boxes} onChange={(event) => setBoxes(event.target.value)} /></label>
          <label htmlFor="admin-male-boxes"><span className="admin-field-heading"><span aria-hidden="true">◇</span> Límite por género</span><b>Cajas para machos:</b><input id="admin-male-boxes" type="number" min="0" max={total || 10000} step="1" value={maleBoxes} onChange={(event) => setMaleBoxes(event.target.value)} placeholder="Igual al total" /></label>
          <label htmlFor="admin-female-boxes"><span className="admin-field-heading"><span aria-hidden="true">◇</span> Límite por género</span><b>Cajas para hembras:</b><input id="admin-female-boxes" type="number" min="0" max={total || 10000} step="1" value={femaleBoxes} onChange={(event) => setFemaleBoxes(event.target.value)} placeholder="Igual al total" /></label>
        </div>
        <p className="admin-feedback">Los límites por género son independientes; el total semanal siempre limita la suma de todas las reservas. Si un límite queda vacío, se usa el total para ese género.</p>
        <div className="admin-dashboard-actions"><button type="button" className="admin-primary" onClick={() => saveAvailability(false)} disabled={saving || isLoading || !validForm}> {saving ? 'Guardando…' : 'Habilitar'} <span aria-hidden="true">→</span></button><button type="button" className="admin-danger" onClick={() => saveAvailability(true)} disabled={saving || !selected || !isEnabled}>{isEnabled ? 'Cerrar Reserva' : 'Reserva Cerrada'} <span aria-hidden="true">→</span></button></div>
        {message && <p className="admin-feedback" role="status">{message}</p>}
      </div>
      <aside className="admin-dashboard-summary" aria-live="polite"><h3>Vista de la Información</h3><p>Semana</p><strong>{weekLabel}</strong><p>Total de cajas:</p><strong>{selected?.totalBoxes ?? (boxes ? total : '—')}</strong>{selected && <><p>Reservadas / disponibles:</p><strong>{selected.reservedBoxes} / {selected.remainingBoxes}</strong><p>Machos disponibles:</p><strong>{selected.remainingMaleBoxes}</strong><p>Hembras disponibles:</p><strong>{selected.remainingFemaleBoxes}</strong></>}<span className={isEnabled ? 'admin-status active' : 'admin-status'}>{selected ? (isEnabled ? 'Reserva habilitada' : 'Reserva cerrada') : 'Semana sin guardar'}</span></aside>
    </section>
  )
}
