import { NextResponse } from 'next/server'
import { asc } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { reservationAvailability } from '@/lib/db/schema'

function isAdmin() {
  return cookies().then((store) => store.get('avinova-dashboard-access')?.value === 'granted')
}

export async function GET() {
  const rows = await db.select().from(reservationAvailability).orderBy(asc(reservationAvailability.weekStart))
  return NextResponse.json({ availability: rows })
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || ![totalBoxes, maleBoxes, femaleBoxes].every((value) => Number.isInteger(value) && value >= 0) || totalBoxes < maleBoxes + femaleBoxes || (opensAt && Number.isNaN(opensAt.getTime())) || (closesAt && Number.isNaN(closesAt.getTime())) || (opensAt && closesAt && closesAt <= opensAt)) {
    return NextResponse.json({ error: 'Configuración de disponibilidad inválida.' }, { status: 400 })
  }
  const values = { weekStart, totalBoxes, maleBoxes, femaleBoxes, opensAt, closesAt, manualClosed: Boolean(body.manualClosed), updatedAt: new Date() }
  const [saved] = await db.insert(reservationAvailability).values(values).onConflictDoUpdate({ target: reservationAvailability.weekStart, set: values }).returning()
  return NextResponse.json({ availability: saved })
}
