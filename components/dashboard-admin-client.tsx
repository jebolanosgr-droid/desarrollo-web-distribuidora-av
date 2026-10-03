'use client'

import { useMemo, useState } from 'react'
import type { reservations } from '@/lib/db/schema'

type Reservation = typeof reservations.$inferSelect

type DashboardAdminClientProps = { reservations: Reservation[] }

function formatDate(value: string | Date) {
  const date = new Date(value)
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
  const [enabled, setEnabled] = useState(true)
  const [boxes, setBoxes] = useState(100)
  const [week, setWeek] = useState('2026-04-14')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [message, setMessage] = useState('')
  const weekLabel = getWeekRange(week)

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesQuery = !normalized || [item.customerName, item.email, item.phone, item.status].some((value) => value.toLowerCase().includes(normalized))
      return matchesQuery && (status === 'all' || item.status === status)
    })
  }, [items, query, status])

  function enableReservation() {
    if (!week || boxes < 1 || !Number.isInteger(boxes)) {
      setMessage('Selecciona una semana e introduce una cantidad de cajas válida.')
      return
    }
    setEnabled(true)
    setMessage('La disponibilidad semanal quedó habilitada.')
  }

  function closeReservation() {
    if (!window.confirm('¿Deseas cerrar la reserva para esta semana?')) return
    setEnabled(false)
    setMessage('La reserva quedó cerrada. Las reservas existentes se conservan.')
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-hero" aria-labelledby="admin-dashboard-title">
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
            <label htmlFor="admin-week"><span className="admin-field-heading"><span aria-hidden="true">▣</span> Disponibilidad de cajas</span><b>Semana:</b><input id="admin-week" type="date" value={week} onChange={(event) => setWeek(event.target.value)} /></label>
            <label htmlFor="admin-boxes"><span className="admin-field-heading"><span aria-hidden="true">◇</span> Número de cajas a habilitar</span><b>Total de cajas:</b><input id="admin-boxes" type="number" min="1" step="1" value={boxes} onChange={(event) => setBoxes(Number(event.target.value))} /></label>
          </div>
          <div className="admin-dashboard-actions"><button type="button" className="admin-primary" onClick={enableReservation}>Habilitar <span aria-hidden="true">→</span></button><button type="button" className="admin-danger" onClick={closeReservation}>{enabled ? 'Cerrar Reserva' : 'Reserva Cerrada'} <span aria-hidden="true">→</span></button></div>
          {message && <p className="admin-feedback" role="status">{message}</p>}
        </div>
        <aside className="admin-dashboard-summary" aria-live="polite"><h3>Vista de la Información</h3><p>Semana</p><strong>{weekLabel}</strong><p>Cantidad de cajas:</p><strong>{enabled ? boxes : 0}</strong><span className={enabled ? 'admin-status active' : 'admin-status'}>{enabled ? 'Reserva habilitada' : 'Reserva cerrada'}</span></aside>
      </section>

      <section className="admin-reservations" aria-labelledby="reservations-title">
        <h2 id="reservations-title">Reservas realizadas por:</h2>
        <div className="admin-reservation-filters"><label htmlFor="reservation-search">Buscar<input id="reservation-search" type="search" placeholder="Nombre, correo o teléfono" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label htmlFor="reservation-status">Estado<select id="reservation-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="cancelled">Cancelada</option></select></label></div>
        {filteredItems.length === 0 ? <div className="admin-empty">No hay reservas que coincidan con los filtros.</div> : filteredItems.map((item) => <article className="admin-reservation-card" key={item.id}><div className="admin-card-heading"><h3>Tipo de usuario: Cliente</h3><span className="admin-reservation-status">{item.status}</span></div><div className="admin-reservation-details"><div><p><b>Nombre:</b> {item.customerName}</p><p><b>Correo:</b> {item.email}</p><p><b>Teléfono:</b> {item.phone}</p></div><div><p><b>Cantidad de cajas:</b> {item.quantity}</p><p><b>Semana:</b> {formatDate(item.deliveryDate)}</p><p><b>Estado:</b> {item.status}</p></div><div><p><b>Entrega:</b> {formatDate(item.deliveryDate)}</p><p><b>Reserva creada:</b> {formatDate(item.createdAt)}</p><p><b>Detalles:</b> Información registrada</p></div></div><p className="admin-comments"><b>Comentarios adicionales:</b> {item.notes || 'Ninguno'}</p></article>)}
      </section>
    </main>
  )
}
