import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'

const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled'])

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('avinova-dashboard-access')?.value !== 'granted') {
    return NextResponse.json({ error: 'No tienes permiso para eliminar reservas.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const id = Number(body?.id)
  if (!Number.isSafeInteger(id) || id < 1) {
    return NextResponse.json({ error: 'La reserva no es válida.' }, { status: 400 })
  }

  const [deletedReservation] = await db.delete(reservations)
    .where(eq(reservations.id, id))
    .returning({ id: reservations.id })

  if (!deletedReservation) return NextResponse.json({ error: 'No se encontró la reserva.' }, { status: 404 })
  return NextResponse.json({ ok: true, id: deletedReservation.id })
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  if (cookieStore.get('avinova-dashboard-access')?.value !== 'granted') {
    return NextResponse.json({ error: 'No tienes permiso para cambiar reservas.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const id = Number(body?.id)
  const status = body?.status
  if (!Number.isSafeInteger(id) || id < 1 || typeof status !== 'string' || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'La reserva o el estado no son válidos.' }, { status: 400 })
  }

  const [reservation] = await db.update(reservations)
    .set({ status, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning()

  if (!reservation) return NextResponse.json({ error: 'No se encontró la reserva.' }, { status: 404 })
  return NextResponse.json({ reservation })
}
