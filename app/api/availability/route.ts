import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reservationAvailability } from '@/lib/db/schema'
import { hasDashboardAccess } from '@/lib/dashboard-access'
import { getAvailabilityOverview, isMondayDate, isValidDateOnly } from '@/lib/reservation-availability'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const availability = await getAvailabilityOverview()
    return NextResponse.json({ availability })
  } catch (error) {
    console.error('[availability] Unable to load weekly availability.', error instanceof Error ? error.message : 'Unknown database error')
    return NextResponse.json({ error: 'No se pudo consultar la disponibilidad. Revisa el estado de la base de datos.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  if (!(await hasDashboardAccess())) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
  if (Number(request.headers.get('content-length') ?? 0) > 16_384) {
    return NextResponse.json({ error: 'La solicitud es demasiado grande.' }, { status: 413 })
  }

  const body = await request.json().catch(() => null)
  const weekStart = typeof body?.weekStart === 'string' ? body.weekStart : ''
  const totalBoxes = Number(body?.totalBoxes)
  const maleBoxes = Number(body?.maleBoxes)
  const femaleBoxes = Number(body?.femaleBoxes)
  const opensAt = body?.opensAt ? new Date(body.opensAt) : null
  const closesAt = body?.closesAt ? new Date(body.closesAt) : null
  const manualClosed = body?.manualClosed

  if (
    !isValidDateOnly(weekStart) ||
    !isMondayDate(weekStart) ||
    !Number.isInteger(totalBoxes) || totalBoxes < 1 || totalBoxes > 10_000 ||
    !Number.isInteger(maleBoxes) || maleBoxes < 0 || maleBoxes > totalBoxes ||
    !Number.isInteger(femaleBoxes) || femaleBoxes < 0 || femaleBoxes > totalBoxes ||
    typeof manualClosed !== 'boolean' ||
    (opensAt && Number.isNaN(opensAt.getTime())) ||
    (closesAt && Number.isNaN(closesAt.getTime())) ||
    (opensAt && closesAt && closesAt <= opensAt)
  ) {
    return NextResponse.json({ error: 'Revisa la semana (debe iniciar en lunes), el total y los límites por género.' }, { status: 400 })
  }

  try {
    const values = {
      weekStart,
      totalBoxes,
      maleBoxes,
      femaleBoxes,
      opensAt,
      closesAt,
      manualClosed,
      updatedAt: new Date(),
    }

    await db
      .insert(reservationAvailability)
      .values(values)
      .onConflictDoUpdate({ target: reservationAvailability.weekStart, set: values })

    const availability = await getAvailabilityOverview()
    return NextResponse.json({ availability })
  } catch (error) {
    console.error('[availability] Unable to save weekly availability.', error instanceof Error ? error.message : 'Unknown database error')
    return NextResponse.json({ error: 'No se pudo guardar la disponibilidad. Revisa el estado de la migración en Render.' }, { status: 503 })
  }
}
