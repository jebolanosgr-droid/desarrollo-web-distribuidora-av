import { and, eq, gte, lt, ne } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservationAvailability, reservations } from '@/lib/db/schema'
import { addDaysToDateOnly, isMondayDate, isValidDateOnly } from '@/lib/reservation-availability'
import { sendReservationEmails } from '@/lib/reservation-email'

class ReservationError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

function readText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function getWeekMonday(value: string) {
  const date = new Date(`${value}T12:00:00.000Z`)
  const weekday = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - weekday + 1)
  return date.toISOString().slice(0, 10)
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 20_480) {
    return NextResponse.json({ error: 'La solicitud es demasiado grande.' }, { status: 413 })
  }

  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch (error) {
    console.error('[reservas] Unable to validate the user session.', error instanceof Error ? error.message : 'Unknown auth error')
    return NextResponse.json({ error: 'El servicio de sesión no está disponible.' }, { status: 503 })
  }
  if (!session?.user) return NextResponse.json({ error: 'Inicia sesión para crear una reserva.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Los datos de la reserva no son válidos.' }, { status: 400 })
  }

  const customerName = readText(body.customerName, 120)
  const phone = readText(body.phone, 32)
  const deliveryDate = typeof body.deliveryDate === 'string' ? body.deliveryDate : ''
  const weekStart = typeof body.weekStart === 'string' ? body.weekStart : ''
  const quantity = body.quantity
  const gender = body.gender
  const email = session.user.email.trim().toLowerCase()
  const department = readText(body.department, 100)
  const city = readText(body.city, 100)
  const address = readText(body.address, 180)
  const postalCode = readText(body.postalCode, 20)
  const recipientName = readText(body.recipientName, 120)
  const recipientPhone = readText(body.recipientPhone, 32)
  const notes = readText(body.notes, 200)

  if (
    !customerName || !phone || !/^[+()\d\s.-]{7,32}$/.test(phone) ||
    !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isValidDateOnly(deliveryDate) || !isMondayDate(weekStart) || getWeekMonday(deliveryDate) !== weekStart ||
    typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 ||
    (gender !== 'Machos' && gender !== 'Hembras') ||
    !department || !city || !address ||
    (recipientPhone !== '' && !/^[+()\d\s.-]{7,32}$/.test(recipientPhone))
  ) {
    return NextResponse.json({ error: 'Revisa tus datos, el género, la cantidad y la fecha de entrega.' }, { status: 400 })
  }

  let createdReservation: typeof reservations.$inferSelect
  try {
    createdReservation = await db.transaction(async (transaction) => {
      const [availability] = await transaction
        .select()
        .from(reservationAvailability)
        .where(eq(reservationAvailability.weekStart, weekStart))
        .for('update')
        .limit(1)

      if (!availability) throw new ReservationError('No hay disponibilidad configurada para esa semana.', 409)

      const now = new Date()
      if (availability.manualClosed || (availability.opensAt && now < availability.opensAt) || (availability.closesAt && now > availability.closesAt)) {
        throw new ReservationError('Las reservas están cerradas para esa semana.', 409)
      }

      const weekEndExclusive = addDaysToDateOnly(weekStart, 7)
      const activeReservations = await transaction
        .select({ quantity: reservations.quantity, gender: reservations.gender })
        .from(reservations)
        .where(and(
          gte(reservations.deliveryDate, weekStart),
          lt(reservations.deliveryDate, weekEndExclusive),
          ne(reservations.status, 'cancelled'),
        ))
      const reservedTotal = activeReservations.reduce((total, reservation) => total + reservation.quantity, 0)
      const reservedForGender = activeReservations
        .filter((reservation) => reservation.gender === gender)
        .reduce((total, reservation) => total + reservation.quantity, 0)
      const genderCapacity = gender === 'Hembras' ? availability.femaleBoxes : availability.maleBoxes

      if (reservedTotal + quantity > availability.totalBoxes) {
        throw new ReservationError('No quedan suficientes cajas en el límite total de esa semana.', 409)
      }
      if (reservedForGender + quantity > genderCapacity) {
        throw new ReservationError('No quedan suficientes cajas del género seleccionado.', 409)
      }

      const duplicateSince = new Date(Date.now() - 60_000)
      const [recentDuplicate] = await transaction
        .select({ id: reservations.id })
        .from(reservations)
        .where(and(
          eq(reservations.userId, session.user.id),
          eq(reservations.deliveryDate, deliveryDate),
          eq(reservations.quantity, quantity),
          eq(reservations.gender, gender),
          eq(reservations.customerName, customerName),
          eq(reservations.phone, phone),
          gte(reservations.createdAt, duplicateSince),
          ne(reservations.status, 'cancelled'),
        ))
        .limit(1)

      if (recentDuplicate) throw new ReservationError('Esta reserva ya fue registrada. Revisa Mis pedidos antes de volver a intentarlo.', 409)

      const [reservation] = await transaction
        .insert(reservations)
        .values({
          userId: session.user.id,
          customerName,
          phone,
          email,
          deliveryDate,
          quantity,
          gender,
          department,
          city,
          address,
          postalCode: postalCode || null,
          recipientName: recipientName || null,
          recipientPhone: recipientPhone || null,
          notes: notes || null,
        })
        .returning()

      return reservation
    })
  } catch (error) {
    if (error instanceof ReservationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[reservas] Unable to create reservation.', error instanceof Error ? error.message : 'Unknown database error')
    return NextResponse.json({ error: 'No se pudo guardar la reserva. Revisa el estado de la migración y la base de datos en Render.' }, { status: 503 })
  }

  const emailStatus = await sendReservationEmails({
    id: createdReservation.id,
    customerName: createdReservation.customerName,
    email: createdReservation.email,
    phone: createdReservation.phone,
    deliveryDate: createdReservation.deliveryDate,
    weekStart,
    quantity: createdReservation.quantity,
    gender: createdReservation.gender,
    department: createdReservation.department,
    city: createdReservation.city,
    address: createdReservation.address,
    postalCode: createdReservation.postalCode,
    recipientName: createdReservation.recipientName,
    recipientPhone: createdReservation.recipientPhone,
    notes: createdReservation.notes,
  }).catch((error: unknown) => {
    console.error('[reservas] Reservation was saved but email notification failed.', error instanceof Error ? error.message : 'Unknown email error')
    return 'failed' as const
  })

  return NextResponse.json({ reservation: { id: createdReservation.id }, emailStatus }, { status: 201 })
}
