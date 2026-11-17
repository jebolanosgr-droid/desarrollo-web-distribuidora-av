'use client'

import type { reservations } from '@/lib/db/schema'
import { OnboardingPage } from '@/components/onboarding/onboarding-page'
import { DashboardAvailabilityManager } from '@/components/dashboard-availability-manager'
import { DashboardReservationsList } from '@/components/dashboard-reservations-list'

type Reservation = typeof reservations.$inferSelect

type DashboardAdminClientProps = {
  reservations: Reservation[]
  reservationsLoadError: boolean
}

export function DashboardAdminClient({ reservations, reservationsLoadError }: DashboardAdminClientProps) {
  return (
    <main className="admin-dashboard">
      <OnboardingPage tourId="dashboard" />
      <section className="admin-dashboard-hero" data-tour="dashboard-intro" aria-labelledby="admin-dashboard-title">
        <div className="admin-dashboard-hero-copy">
          <h1 id="admin-dashboard-title">Administrador de reservas</h1>
          <p>Establece las semanas y la cantidad de cajas disponibles para reservar.</p>
          <p>Consulta los datos y las especificaciones de cada reserva realizada.</p>
        </div>
      </section>
      <DashboardAvailabilityManager />
      <DashboardReservationsList reservations={reservations} loadError={reservationsLoadError} />
    </main>
  )
}
