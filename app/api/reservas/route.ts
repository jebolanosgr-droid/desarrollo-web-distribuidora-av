import { NextResponse } from 'next/server'
import { and, eq, gte, lt, ne } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservationAvailability, reservations } from '@/lib/db/schema'
import { sendReservationEmail } from '@/lib/reservation-email'

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Inicia sesión para reservar.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const quantity = Number(body?.quantity)
  const deliveryDate = body?.deliveryDate
  const gender = body?.gender
  const customerName = typeof body?.customerName === 'string' ? body.customerName.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (!customerName || customerName.length > 160 || !phone || phone.length > 40 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || !validDate(deliveryDate) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !['Machos', 'Hembras'].includes(gender)) {
    return NextResponse.json({ error: 'Revisa los datos de la reserva.' }, { status: 400 })
  }

  const requested = new Date(`${deliveryDate}T00:00:00Z`)
  const weeks = await db.select().from(reservationAvailability)
  const week = weeks.find((candidate) => {
    const start = new Date(`${candidate.weekStart}T00:00:00Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    return requested >= start && requested < end
  })
  if (!week) return NextResponse.json({ error: 'No hay disponibilidad configurada para esa semana.' }, { status: 409 })

  try {
    const reservation = await db.transaction(async (tx) => {
      const [lockedWeek] = await tx.select().from(reservationAvailability).where(eq(reservationAvailability.id, week.id)).for('update')
      if (!lockedWeek) throw new Error('WEEK_NOT_AVAILABLE')
      const now = new Date()
      if (lockedWeek.manualClosed || (lockedWeek.opensAt && now < lockedWeek.opensAt) || (lockedWeek.closesAt && now > lockedWeek.closesAt)) throw new Error('RESERVATIONS_CLOSED')

      const start = lockedWeek.weekStart
      const end = new Date(`${start}T00:00:00Z`)
      end.setUTCDate(end.getUTCDate() + 7)
      const endDate = end.toISOString().slice(0, 10)
      const booked = await tx.select({ deliveryDate: reservations.deliveryDate, gender: reservations.gender, quantity: reservations.quantity, userId: reservations.userId }).from(reservations).where(and(gte(reservations.deliveryDate, start), lt(reservations.deliveryDate, endDate), ne(reservations.status, 'cancelled')))
      const maleReserved = booked.filter((item) => item.gender === 'Machos').reduce((sum, item) => sum + item.quantity, 0)
      const femaleReserved = booked.filter((item) => item.gender === 'Hembras').reduce((sum, item) => sum + item.quantity, 0)
      const reserved = maleReserved + femaleReserved
      const genderReserved = gender === 'Hembras' ? femaleReserved : maleReserved
      const genderCapacity = gender === 'Hembras' ? lockedWeek.femaleBoxes : lockedWeek.maleBoxes
      if (reserved + quantity > lockedWeek.totalBoxes || genderReserved + quantity > genderCapacity) throw new Error('INSUFFICIENT_CAPACITY')
      if (booked.some((item) => item.userId === session.user.id && item.deliveryDate === deliveryDate && item.gender === gender)) throw new Error('DUPLICATE_RESERVATION')

      const [created] = await tx.insert(reservations).values({
        userId: session.user.id,
        customerName,
        phone,
        email,
        deliveryDate,
        quantity,
        gender,
        department: typeof body.department === 'string' ? body.department.trim().slice(0, 100) || null : null,
        city: typeof body.city === 'string' ? body.city.trim().slice(0, 100) || null : null,
        address: typeof body.address === 'string' ? body.address.trim().slice(0, 250) || null : null,
        postalCode: typeof body.postalCode === 'string' ? body.postalCode.trim().slice(0, 20) || null : null,
        recipientName: typeof body.recipientName === 'string' ? body.recipientName.trim().slice(0, 160) || null : null,
        recipientPhone: typeof body.recipientPhone === 'string' ? body.recipientPhone.trim().slice(0, 40) || null : null,
        notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 200) || null : null,
      }).returning()
      return created
    })
    try {
      const emailResult = await sendReservationEmail(reservation, process.env.APP_BASE_URL ?? new URL(request.url).origin, session.user.email)
      if (!emailResult.sent) console.info('[avinova] Reservation email skipped: email provider is not configured.')
    } catch (error) {
      console.error('[avinova] Reservation email failed; reservation remains saved.', error instanceof Error ? error.message : 'Unknown provider error')
    }
    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error) {
    const reason = error instanceof Error ? error.message : ''
    if (reason === 'RESERVATIONS_CLOSED') return NextResponse.json({ error: 'Las reservas están cerradas en este momento.' }, { status: 409 })
    if (reason === 'INSUFFICIENT_CAPACITY') return NextResponse.json({ error: 'No hay cajas disponibles suficientes para esa semana y género.' }, { status: 409 })
    if (reason === 'DUPLICATE_RESERVATION') return NextResponse.json({ error: 'Ya existe una reserva activa para esa fecha y género.' }, { status: 409 })
    if (reason === 'WEEK_NOT_AVAILABLE') return NextResponse.json({ error: 'La disponibilidad cambió. Actualiza la página e inténtalo de nuevo.' }, { status: 409 })
    throw error
  }
}
