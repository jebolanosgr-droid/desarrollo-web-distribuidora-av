'use client'

import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

type Reservation = { id: number; deliveryDate: string; quantity: number; status: string; customerName: string; email: string; phone: string; notes: string | null; createdAt: Date }
export function DashboardClient({ user, reservations }: { user: { name: string; email: string }; reservations: Reservation[] }) {
  return <main className="dashboard-page"><div className="dashboard-top"><div><p className="eyebrow">AVINOVA GROUP</p><h1>Panel de reservas</h1><p>Hola, {user.name}. Aquí puedes consultar tus solicitudes.</p></div><div className="dashboard-actions"><Link href="/reserva">Nueva reserva</Link><button onClick={async () => { await authClient.signOut(); window.location.href = '/login' }}>Cerrar sesión</button></div></div><section className="dashboard-card"><h2>Mis reservas</h2>{reservations.length === 0 ? <div className="dashboard-empty"><p>Aún no tienes reservas.</p><Link href="/reserva">Crear mi primera reserva</Link></div> : <div className="reservation-list">{reservations.map((reservation) => <article key={reservation.id}><div><strong>Reserva #{reservation.id}</strong><span>{reservation.deliveryDate} · {reservation.quantity} caja{reservation.quantity === 1 ? '' : 's'}</span></div><b data-status={reservation.status}>{reservation.status === 'pending' ? 'Pendiente' : reservation.status}</b></article>)}</div>}</section></main>
}
