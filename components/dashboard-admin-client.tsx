'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import type { reservations } from '@/lib/db/schema'
import { OnboardingPage } from '@/components/onboarding/onboarding-page'
import { ReservationPdfButton } from '@/components/reservation-pdf-button'

type Reservation = typeof reservations.$inferSelect

type DashboardAdminClientProps = { reservations: Reservation[] }

function formatDate(value: string | Date) {
  const date = new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function getWeekRange(value: string) {
  if (!value) return 'Selecciona una semana'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Selecciona una semana'
  const day = date.getDay() || 7
  const start = new Date(date)
  start.setDate(date.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' })
  return `${formatter.format(start)} - ${formatter.format(end)} de ${end.getFullYear()}`
}

export function DashboardAdminClient({ reservations: items }: DashboardAdminClientProps) {
  const fetchAvailability = (url: string) => fetch(url, { cache: 'no-store' }).then(async (response) => {
    if (!response.ok) throw new Error('No se pudo cargar la disponibilidad')
    return response.json() as Promise<{ availability: Array<{ id: number; weekStart: string; totalBoxes: number; maleBoxes: number; femaleBoxes: number; manualClosed: boolean; reservedBoxes: number }> }>
  })
  const { data, error: availabilityError, mutate } = useSWR('/api/availability', fetchAvailability, { revalidateOnFocus: true })
  const [boxes, setBoxes] = useState<number | null>(null)
  const [maleBoxes, setMaleBoxes] = useState<number | null>(null)
  const [femaleBoxes, setFemaleBoxes] = useState<number | null>(null)
  const [week, setWeek] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const weeks = data?.availability ?? []
  const selectedWeek = week || weeks[0]?.weekStart || ''
  const activeWeek = weeks.find((item) => item.weekStart === selectedWeek)
  const totalBoxes = boxes ?? activeWeek?.totalBoxes ?? 0
  const maleCapacity = maleBoxes ?? activeWeek?.maleBoxes ?? 0
  const femaleCapacity = femaleBoxes ?? activeWeek?.femaleBoxes ?? 0
  const weekEnd = selectedWeek ? (() => { const date = new Date(`${selectedWeek}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 6); return date.toISOString().slice(0, 10) })() : ''
  const enabled = Boolean(activeWeek && !activeWeek.manualClosed)
  const weekLabel = selectedWeek && weekEnd ? `${formatDate(`${selectedWeek}T12:00:00`)} - ${formatDate(`${weekEnd}T12:00:00`)}` : 'Selecciona una semana'

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesQuery = !normalized || [item.customerName, item.email, item.phone, item.status].some((value) => value.toLowerCase().includes(normalized))
      return matchesQuery && (status === 'all' || item.status === status)
    })
  }, [items, query, status])

  async function saveAvailability(manualClosed: boolean) {
    if (!selectedWeek || !/^\d{4}-\d{2}-\d{2}$/.test(selectedWeek) || !Number.isInteger(totalBoxes) || totalBoxes < 0 || !Number.isInteger(maleCapacity) || !Number.isInteger(femaleCapacity) || maleCapacity < 0 || femaleCapacity < 0 || totalBoxes < maleCapacity + femaleCapacity) {
      setMessage('Indica una fecha válida y cantidades de cajas coherentes; el total debe cubrir las cantidades por género.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weekStart: selectedWeek, totalBoxes, maleBoxes: maleCapacity, femaleBoxes: femaleCapacity, manualClosed }) })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error ?? 'No se pudo guardar la disponibilidad.')
      setWeek(selectedWeek)
      setBoxes(null)
      setMaleBoxes(null)
      setFemaleBoxes(null)
      await mutate()
      setMessage(manualClosed ? 'La disponibilidad se guardó cerrada.' : 'La disponibilidad semanal se guardó y quedó habilitada.')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'No se pudo guardar la disponibilidad.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="admin-dashboard">
      <OnboardingPage tourId="dashboard" />
      <section className="admin-dashboard-hero" data-tour="dashboard-intro" aria-labelledby="admin-dashboard-title">
        <div className="admin-dashboard-hero-copy">
          <h1 id="admin-dashboard-title">Administrador de reservas</h1>
          <p>Establece el tiempo y el número de cajas que se darán para reservar.</p>
          <p>Observa qué usuarios han reservado con sus datos y especificaciones de la reserva.</p>
        </div>
      </section>

      <section className="admin-dashboard-control" aria-labelledby="enable-title">
        <div className="admin-dashboard-fields">
          <h2 id="enable-title">Habilitar reserva</h2>
          <div className="admin-dashboard-grid">
            <label htmlFor="admin-week"><span className="admin-field-heading"><span aria-hidden="true">▣</span> Disponibilidad de cajas</span><b>Inicio de semana:</b><input id="admin-week" type="date" value={selectedWeek} onChange={(event) => { setWeek(event.target.value); setBoxes(null); setMaleBoxes(null); setFemaleBoxes(null) }} /></label><label htmlFor="admin-week-end"><span className="admin-field-heading"><span aria-hidden="true">▣</span> Semana de reserva</span><b>Fin de semana (automático):</b><input id="admin-week-end" type="date" value={weekEnd} readOnly /></label>
            <label htmlFor="admin-boxes"><span className="admin-field-heading"><span aria-hidden="true">◇</span> Número total de cajas</span><b>Total:</b><input id="admin-boxes" type="number" min="0" step="1" value={totalBoxes} onChange={(event) => setBoxes(Number(event.target.value))} /></label>
            <label htmlFor="admin-male-boxes"><b>Cajas para machos:</b><input id="admin-male-boxes" type="number" min="0" step="1" value={maleCapacity} onChange={(event) => setMaleBoxes(Number(event.target.value))} /></label>
            <label htmlFor="admin-female-boxes"><b>Cajas para hembras:</b><input id="admin-female-boxes" type="number" min="0" step="1" value={femaleCapacity} onChange={(event) => setFemaleBoxes(Number(event.target.value))} /></label>
          </div>
          {availabilityError && <p className="admin-feedback" role="alert">No se pudo consultar PostgreSQL. Confirma que la migración de disponibilidad esté aplicada.</p>}
          <div className="admin-dashboard-actions"><button type="button" className="admin-primary" disabled={saving} onClick={() => saveAvailability(false)}>{saving ? 'Guardando…' : 'Guardar y habilitar'} <span aria-hidden="true">→</span></button><button type="button" className="admin-danger" disabled={saving || !selectedWeek} onClick={() => saveAvailability(true)}>{enabled ? 'Guardar cerrada' : 'Mantener cerrada'} <span aria-hidden="true">→</span></button></div>
          {message && <p className="admin-feedback" role="status">{message}</p>}
        </div>
        <aside className="admin-dashboard-summary" aria-live="polite"><h3>Vista de la Información</h3><p>Semana activa</p><strong>{weekLabel}</strong><p>Cajas totales / reservadas / disponibles:</p><strong>{enabled ? totalBoxes : 0} / {activeWeek?.reservedBoxes ?? 0} / {enabled ? Math.max(0, totalBoxes - (activeWeek?.reservedBoxes ?? 0)) : 0}</strong><span className={enabled ? 'admin-status active' : 'admin-status'}>{enabled ? 'Reserva habilitada' : 'Reserva cerrada o sin configurar'}</span></aside>
      </section>

      <section className="admin-reservations" aria-labelledby="reservations-title">
        <h2 id="reservations-title">Reservas realizadas por:</h2>
        <div className="admin-reservation-filters"><label htmlFor="reservation-search">Buscar<input id="reservation-search" type="search" placeholder="Nombre, correo o teléfono" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label htmlFor="reservation-status">Estado<select id="reservation-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="cancelled">Cancelada</option></select></label></div>
        {filteredItems.length === 0 ? <div className="admin-empty">No hay reservas que coincidan con los filtros.</div> : filteredItems.map((item) => <article className="admin-reservation-card" key={item.id}><div className="admin-card-heading"><h3>Tipo de usuario: Cliente</h3><span className="admin-reservation-status">{item.status}</span></div><div className="admin-reservation-details"><div><p><b>Nombre:</b> {item.customerName}</p><p><b>Correo:</b> {item.email}</p><p><b>Teléfono:</b> {item.phone}</p></div><div><p><b>Cantidad de cajas:</b> {item.quantity}</p><p><b>Semana:</b> {getWeekRange(item.deliveryDate)}</p><p><b>Estado:</b> {item.status}</p></div><div><p><b>Entrega:</b> {formatDate(item.deliveryDate)}</p><p><b>Reserva creada:</b> {formatDate(item.createdAt)}</p><p><b>Género:</b> {item.gender}</p><p><b>Departamento:</b> {item.department || 'No informado'}</p><p><b>Ciudad:</b> {item.city || 'No informada'}</p><p><b>Dirección:</b> {item.address || 'No informada'}</p><p><b>Código postal:</b> {item.postalCode || 'No informado'}</p><p><b>Recibe:</b> {item.recipientName || 'No informado'}{item.recipientPhone ? ` · ${item.recipientPhone}` : ''}</p><p><b>Cancelación solicitada:</b> {item.cancellationRequestedAt ? formatDate(item.cancellationRequestedAt) : 'No'}</p></div></div><p className="admin-comments"><b>Comentarios adicionales:</b> {item.notes || 'Ninguno'}</p><div className="admin-reservation-actions"><ReservationPdfButton reservation={{ ...item, status: item.status === 'pending' ? 'Pendiente' : item.status === 'confirmed' ? 'Confirmada' : item.status === 'delivered' ? 'Entregada' : item.status === 'cancelled' ? 'Cancelada' : item.status }} /></div></article>)}
      </section>
    </main>
  )
}
