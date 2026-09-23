import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')
  const items = await db.select().from(reservations).where(eq(reservations.userId, session.user.id)).orderBy(desc(reservations.createdAt))
  return <DashboardClient user={session.user} reservations={items} />
}
