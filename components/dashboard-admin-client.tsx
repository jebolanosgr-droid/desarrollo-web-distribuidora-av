'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { reservations } from '@/lib/db/schema'

type Reservation = typeof reservations.$inferSelect

export function DashboardAdminClient({ reservations: items }: { reservations: Reservation[] }) {
  const [enabled, setEnabled] = useState(true)
  const [boxes, setBoxes] = useState(100)
  const [week, setWeek] = useState('14 - 20 de abril de 2026')

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-hero"><p>Panel privado</p><h1>Administrador de reservas</h1><span>Establece el tiempo y el número de cajas disponibles para reservar. Observa qué usuarios han reservado y sus especificaciones.</span></section>
      <section className="admin-dashboard-control">
        <div className="admin-dashboard-fields"><p className="admin-dashboard-eyebrow">Disponibilidad</p><h2>Habilitar reserva</h2><div className="admin-dashboard-grid"><label>Semana<input value={week} onChange={(event) => setWeek(event.target.value)} /></label><label>Total de cajas<input type="number" min="0" value={boxes} onChange={(event) => setBoxes(Number(event.target.value))} /></label></div><div className="admin-dashboard-actions"><button className="admin-primary" onClick={() => setEnabled(true)}>Habilitar →</button><button className="admin-danger" onClick={() => setEnabled(false)}>Cerrar reserva →</button></div></div>
        <aside className="admin-dashboard-summary"><h3>Vista de la información</h3><p>Semana</p><strong>{week}</strong><p>Cantidad de cajas</p><strong>{enabled ? boxes : 0}</strong><span className={enabled ? 'admin-status active' : 'admin-status'}>{enabled ? 'Reserva habilitada' : 'Reserva cerrada'}</span></aside>
      </section>
      <section className="admin-reservations"><h2>Reservas realizadas por:</h2>{items.length === 0 ? <div className="admin-empty">Todavía no hay reservas registradas.</div> : items.map((item) => <article className="admin-reservation-card" key={item.id}><h3>Tipo de usuario: cliente</h3><div className="admin-reservation-details"><p><b>Nombre:</b> {item.customerName}</p><p><b>Correo:</b> {item.email}</p><p><b>Teléfono:</b> {item.phone}</p><p><b>Cantidad de cajas:</b> {item.quantity}</p><p><b>Fecha de entrega:</b> {item.deliveryDate.toString()}</p><p><b>Comentarios:</b> {item.notes || 'Ninguno'}</p></div></article>)}</section><Link className="admin-back-link" href="/">← Volver al sitio</Link>
    </main>
  )
}
