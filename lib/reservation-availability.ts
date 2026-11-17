import { asc, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservationAvailability, reservations } from '@/lib/db/schema'

export type AvailabilityOverview = typeof reservationAvailability.$inferSelect & {
  reservedBoxes: number
  remainingBoxes: number
  reservedMaleBoxes: number
  remainingMaleBoxes: number
  reservedFemaleBoxes: number
  remainingFemaleBoxes: number
}

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function addDaysToDateOnly(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isMondayDate(value: string): boolean {
  return isValidDateOnly(value) && new Date(`${value}T12:00:00.000Z`).getUTCDay() === 1
}

export async function getAvailabilityOverview(): Promise<AvailabilityOverview[]> {
  const configuredWeeks = await db
    .select()
    .from(reservationAvailability)
    .orderBy(asc(reservationAvailability.weekStart))

  if (configuredWeeks.length === 0) return []

  const activeReservations = await db
    .select({ deliveryDate: reservations.deliveryDate, quantity: reservations.quantity, gender: reservations.gender })
    .from(reservations)
    .where(ne(reservations.status, 'cancelled'))

  return configuredWeeks.map((week) => {
    const weekEndExclusive = addDaysToDateOnly(week.weekStart, 7)
    const reservationsForWeek = activeReservations.filter(
      (reservation) => reservation.deliveryDate >= week.weekStart && reservation.deliveryDate < weekEndExclusive,
    )
    const reservedBoxes = reservationsForWeek.reduce((total, reservation) => total + reservation.quantity, 0)
    const reservedMaleBoxes = reservationsForWeek
      .filter((reservation) => reservation.gender === 'Machos')
      .reduce((total, reservation) => total + reservation.quantity, 0)
    const reservedFemaleBoxes = reservationsForWeek
      .filter((reservation) => reservation.gender === 'Hembras')
      .reduce((total, reservation) => total + reservation.quantity, 0)

    return {
      ...week,
      reservedBoxes,
      remainingBoxes: Math.max(0, week.totalBoxes - reservedBoxes),
      reservedMaleBoxes,
      remainingMaleBoxes: Math.max(0, Math.min(week.totalBoxes, week.maleBoxes) - reservedMaleBoxes),
      reservedFemaleBoxes,
      remainingFemaleBoxes: Math.max(0, Math.min(week.totalBoxes, week.femaleBoxes) - reservedFemaleBoxes),
    }
  })
}
