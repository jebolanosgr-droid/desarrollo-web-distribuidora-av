'use client'

import { useMemo, useState } from 'react'
import type { reservations } from '@/lib/db/schema'
import { ReservationPdfButton } from '@/components/reservation-pdf-button'

type Reservation = typeof reservations.$inferSelect

type Props = {
  reservations: Reservation[]
  loadError: boolean
}

function asDate(value: string | Date) {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00-05:00`) : new Date(value)
}

function formatDate(value: string | Date) {
  const date = asDate(value)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' }).format(date)
}

function getWeekRange(value: string) {
  const date = asDate(value)
  if (Number.isNaN(date.getTime())) return 'Semana no disponible'
  const start = new Date(date)
  const weekday = start.getDay() || 7
  start.setDate(start.getDate() - weekday + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', timeZone: 'America/Bogota' })
  return `${formatter.format(start)} al ${formatter.format(end)} de ${end.getFullYear()}`
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
}

export function DashboardReservationsList({ reservations: items, loadError }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [deliveryDate, setDeliveryDate] = useState('')

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return items.filter((item) => {
      const searchable = [
        item.customerName,
        item.email,
        item.phone,
        item.status,
        item.gender,
        item.city,
        item.department,
        item.address,
        item.recipientName,
        item.recipientPhone,
        item.notes,
      ].filter((value): value is string => Boolean(value))
      const matchesQuery = !normalized || searchable.some((value) => value.toLowerCase().includes(normalized))
      const matchesStatus = status === 'all' || item.status === status
      const matchesDate = !deliveryDate || item.deliveryDate === deliveryDate
      return matchesQuery && matchesStatus && matchesDate
    })
  }, [deliveryDate, items, query, status])

  return (
    <section className="admin-reservations" aria-labelledby="reservations-title">
      <h2 id="reservations-title">Reservas realizadas por:</h2>
      <div className="admin-reservation-filters">
        <label htmlFor="reservation-search">Buscar<input id="reservation-search" type="search" placeholder="Nombre, correo, teléfono o dirección" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label htmlFor="reservation-status">Estado<select id="reservation-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="confirmed">Confirmada</option><option value="delivered">Entregada</option><option value="cancelled">Cancelada</option></select></label>
        <label htmlFor="reservation-date">Fecha de entrega<input id="reservation-date" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
      </div>
      {loadError && <p className="admin-feedback" role="alert">No se pudieron cargar las reservas. Revisa la conexión y las migraciones de la base de datos en Render.</p>}
      {loadError ? null : filteredItems.length === 0 ? <div className="admin-empty">No hay reservas que coincidan con los filtros.</div> : filteredItems.map((item) => (
        <article className="admin-reservation-card" key={item.id}>
          <div className="admin-card-heading"><h3>Tipo de usuario: Cliente</h3><span className="admin-reservation-status">{statusLabels[item.status] ?? item.status}</span></div>
          <div className="admin-reservation-details">
            <div><p><b>Nombre:</b> {item.customerName}</p><p><b>Correo:</b> {item.email}</p><p><b>Teléfono:</b> {item.phone}</p></div>
            <div><p><b>Cantidad de cajas:</b> {item.quantity}</p><p><b>Género:</b> {item.gender}</p><p><b>Semana:</b> {getWeekRange(item.deliveryDate)}</p></div>
            <div><p><b>Fecha de entrega:</b> {formatDate(item.deliveryDate)}</p><p><b>Dirección:</b> {[item.address, item.city, item.department, item.postalCode].filter(Boolean).join(', ') || 'No informada'}</p><p><b>Entrega a:</b> {item.recipientName || 'Titular'}{item.recipientPhone ? ` · ${item.recipientPhone}` : ''}</p></div>
          </div>
          <p><b>Reserva creada:</b> {formatDate(item.createdAt)}</p>
          {item.cancellationRequestedAt && <p><b>Cancelación solicitada:</b> {formatDate(item.cancellationRequestedAt)}</p>}
          <p className="admin-comments"><b>Comentarios adicionales:</b> {item.notes || 'Ninguno'}</p>
          <div className="admin-reservation-actions"><ReservationPdfButton reservation={item} /></div>
        </article>
      ))}
    </section>
  )
}
