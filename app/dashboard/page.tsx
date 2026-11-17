import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { hasDashboardAccess } from '@/lib/dashboard-access'
import { DashboardAdminClient } from '@/components/dashboard-admin-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  if (!(await hasDashboardAccess())) redirect('/dashboard-access')

  let items: Array<typeof reservations.$inferSelect> = []
  let reservationsLoadError = false
  try {
    items = await db.select().from(reservations).orderBy(desc(reservations.createdAt))
  } catch (error) {
    reservationsLoadError = true
    console.error('[dashboard] Unable to load reservations.', error instanceof Error ? error.message : 'Unknown database error')
  }

  return <DashboardAdminClient reservations={items} reservationsLoadError={reservationsLoadError} />
}
