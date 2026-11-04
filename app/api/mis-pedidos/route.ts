import { NextResponse } from 'next/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await db.select().from(reservations).where(eq(reservations.userId, session.user.id)).orderBy(desc(reservations.createdAt))
  return NextResponse.json({ reservations: items })
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const id = Number(body?.id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  const [item] = await db.select({ id: reservations.id, status: reservations.status }).from(reservations).where(and(eq(reservations.id, id), eq(reservations.userId, session.user.id))).limit(1)
  if (!item) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (item.status !== 'pending') return NextResponse.json({ error: 'Solo puedes solicitar la cancelación de pedidos pendientes.' }, { status: 409 })
  const [updated] = await db.update(reservations).set({ cancellationRequestedAt: new Date(), updatedAt: new Date() }).where(and(eq(reservations.id, id), eq(reservations.userId, session.user.id), eq(reservations.status, 'pending'), isNull(reservations.cancellationRequestedAt))).returning()
  if (!updated) return NextResponse.json({ error: 'Este pedido ya tiene una cancelación solicitada.' }, { status: 409 })
  return NextResponse.json({ reservation: updated, notification: 'Solicitud registrada para revisión de Avinova.' })
}
