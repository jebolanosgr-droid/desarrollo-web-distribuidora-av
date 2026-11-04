import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import MisPedidosClient from './mis-pedidos-client'

export const dynamic = 'force-dynamic'

export default async function MisPedidosPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login?returnTo=/mis-pedidos')
  return <MisPedidosClient />
}
