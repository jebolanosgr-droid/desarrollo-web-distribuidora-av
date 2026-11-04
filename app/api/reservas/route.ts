import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservationAvailability, reservations } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const quantity = Number(body.quantity)
  if (!body.customerName || !body.phone || !body.email || !body.deliveryDate || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  const requestedDate = new Date(`${String(body.deliveryDate)}T12:00:00-05:00`)
  if (Number.isNaN(requestedDate.getTime())) return NextResponse.json({ error: 'Fecha de entrega inválida' }, { status: 400 })
  const availabilityRows = await db.select().from(reservationAvailability)
  const availability = availabilityRows.find((row) => {
    const start = new Date(`${row.weekStart}T00:00:00-05:00`)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return requestedDate >= start && requestedDate < end
  })
  if (!availability) return NextResponse.json({ error: 'No hay disponibilidad configurada para esa fecha.' }, { status: 409 })
  const now = new Date()
  if (availability.manualClosed || (availability.opensAt && now < availability.opensAt) || (availability.closesAt && now > availability.closesAt)) return NextResponse.json({ error: 'Las reservas están cerradas en este momento.' }, { status: 409 })
  const reservedRows = await db.select({ quantity: reservations.quantity }).from(reservations).where(and(eq(reservations.deliveryDate, String(body.deliveryDate)), eq(reservations.gender, body.gender === 'Hembras' ? 'Hembras' : 'Machos')))
  const reserved = reservedRows.reduce((total, row) => total + row.quantity, 0)
  const genderCapacity = body.gender === 'Hembras' ? availability.femaleBoxes : availability.maleBoxes
  if (reserved + quantity > Math.min(availability.totalBoxes, genderCapacity)) return NextResponse.json({ error: 'No hay disponibilidad suficiente.' }, { status: 409 })
  const [reservation] = await db.insert(reservations).values({ userId: session.user.id, customerName: String(body.customerName).trim(), phone: String(body.phone).trim(), email: String(body.email).trim(), deliveryDate: String(body.deliveryDate), quantity, gender: body.gender === 'Hembras' ? 'Hembras' : 'Machos', department: body.department ? String(body.department).trim() : null, city: body.city ? String(body.city).trim() : null, address: body.address ? String(body.address).trim() : null, postalCode: body.postalCode ? String(body.postalCode).trim() : null, recipientName: body.recipientName ? String(body.recipientName).trim() : null, recipientPhone: body.recipientPhone ? String(body.recipientPhone).trim() : null, notes: body.notes ? String(body.notes).slice(0, 200) : null }).returning({ id: reservations.id })
  return NextResponse.json({ reservation }, { status: 201 })
}
