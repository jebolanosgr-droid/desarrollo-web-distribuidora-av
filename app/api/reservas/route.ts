import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const quantity = Number(body.quantity)
  if (!body.customerName || !body.phone || !body.email || !body.deliveryDate || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  const [reservation] = await db.insert(reservations).values({ userId: session.user.id, customerName: String(body.customerName).trim(), phone: String(body.phone).trim(), email: String(body.email).trim(), deliveryDate: String(body.deliveryDate), quantity, gender: body.gender === 'Hembras' ? 'Hembras' : 'Machos', department: body.department ? String(body.department).trim() : null, city: body.city ? String(body.city).trim() : null, address: body.address ? String(body.address).trim() : null, postalCode: body.postalCode ? String(body.postalCode).trim() : null, recipientName: body.recipientName ? String(body.recipientName).trim() : null, recipientPhone: body.recipientPhone ? String(body.recipientPhone).trim() : null, notes: body.notes ? String(body.notes).slice(0, 200) : null }).returning({ id: reservations.id })
  return NextResponse.json({ reservation }, { status: 201 })
}
