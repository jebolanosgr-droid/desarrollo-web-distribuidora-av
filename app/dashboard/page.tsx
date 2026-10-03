import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { DashboardAdminClient } from '@/components/dashboard-admin-client'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('avinova-dashboard-access')?.value !== 'granted') redirect('/dashboard-access')
  const items = await db.select().from(reservations).orderBy(desc(reservations.createdAt))
  return <DashboardAdminClient reservations={items} />
}
