import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { DashboardAdminClient } from '@/components/dashboard-admin-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('avinova-dashboard-access')?.value !== 'granted') redirect('/dashboard-access')

  let items: Array<typeof reservations.$inferSelect> = []
  try {
    items = await db.select().from(reservations).orderBy(desc(reservations.createdAt))
  } catch {
    // Render can start the page before its database is reachable; keep the protected route renderable.
  }

  return <DashboardAdminClient reservations={items} />
}
