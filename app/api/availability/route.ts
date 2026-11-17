import { NextResponse } from 'next/server'
import { and, asc, eq, gte, lt, ne } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { reservationAvailability, reservations } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

function isAdmin() {
  return cookies().then((store) => store.get('avinova-dashboard-access')?.value === 'granted')
}

export async function GET() {
  const rows = await db.select().from(reservationAvailability).orderBy(asc(reservationAvailability.weekStart))
  const orders = await db.select({ deliveryDate: reservations.deliveryDate, gender: reservations.gender, quantity: reservations.quantity }).from(reservations).where(ne(reservations.status, 'cancelled'))
  const availability = rows.map((row) => {
    const start = new Date(`${row.weekStart}T00:00:00Z`)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    const weekOrders = orders.filter((order) => {
      const delivery = new Date(`${order.deliveryDate}T00:00:00Z`)
      return delivery >= start && delivery < end
    })
    const maleReserved = weekOrders.filter((order) => order.gender === 'Machos').reduce((sum, order) => sum + order.quantity, 0)
    const femaleReserved = weekOrders.filter((order) => order.gender === 'Hembras').reduce((sum, order) => sum + order.quantity, 0)
    const reservedBoxes = maleReserved + femaleReserved
    return {
      ...row,
      maleReserved,
      femaleReserved,
      reservedBoxes,
      availableBoxes: Math.max(0, row.totalBoxes - reservedBoxes),
      maleAvailable: Math.max(0, row.maleBoxes - maleReserved),
      femaleAvailable: Math.max(0, row.femaleBoxes - femaleReserved),
    }
  })
  return NextResponse.json({ availability })
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const body = await request.json().catch(() => null)
  const weekStart = typeof body?.weekStart === 'string' ? body.weekStart : ''
  const totalBoxes = Number(body?.totalBoxes)
  const maleBoxes = Number(body?.maleBoxes)
  const femaleBoxes = Number(body?.femaleBoxes)
  const opensAt = body?.opensAt ? new Date(body.opensAt) : null
  const closesAt = body?.closesAt ? new Date(body.closesAt) : null
  const parsedWeekStart = new Date(`${weekStart}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || Number.isNaN(parsedWeekStart.getTime()) || parsedWeekStart.toISOString().slice(0, 10) !== weekStart || ![totalBoxes, maleBoxes, femaleBoxes].every((value) => Number.isInteger(value) && value >= 0) || totalBoxes < maleBoxes + femaleBoxes || (opensAt && Number.isNaN(opensAt.getTime())) || (closesAt && Number.isNaN(closesAt.getTime())) || (opensAt && closesAt && closesAt <= opensAt)) {
    return NextResponse.json({ error: 'Configuración de disponibilidad inválida.' }, { status: 400 })
  }
  const values = { weekStart, totalBoxes, maleBoxes, femaleBoxes, opensAt, closesAt, manualClosed: Boolean(body.manualClosed), updatedAt: new Date() }
  const saved = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(reservationAvailability).where(eq(reservationAvailability.weekStart, weekStart)).for('update')
    const end = new Date(`${weekStart}T00:00:00Z`)
    end.setUTCDate(end.getUTCDate() + 7)
    const bookings = await tx.select({ gender: reservations.gender, quantity: reservations.quantity }).from(reservations).where(and(gte(reservations.deliveryDate, weekStart), lt(reservations.deliveryDate, end.toISOString().slice(0, 10)), ne(reservations.status, 'cancelled')))
    const totalReserved = bookings.reduce((sum, booking) => sum + booking.quantity, 0)
    const maleReserved = bookings.filter((booking) => booking.gender === 'Machos').reduce((sum, booking) => sum + booking.quantity, 0)
    const femaleReserved = bookings.filter((booking) => booking.gender === 'Hembras').reduce((sum, booking) => sum + booking.quantity, 0)
    if (totalBoxes < totalReserved || maleBoxes < maleReserved || femaleBoxes < femaleReserved) throw new Error('CAPACITY_BELOW_RESERVED')
    const [row] = existing
      ? await tx.update(reservationAvailability).set(values).where(eq(reservationAvailability.id, existing.id)).returning()
      : await tx.insert(reservationAvailability).values(values).returning()
    return row
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === 'CAPACITY_BELOW_RESERVED') return null
    throw error
  })
  if (!saved) return NextResponse.json({ error: 'No puedes fijar una capacidad inferior a las cajas ya reservadas.' }, { status: 409 })
  return NextResponse.json({ availability: saved })
}
