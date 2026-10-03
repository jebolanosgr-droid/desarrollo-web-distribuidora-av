import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const dashboardPassword = process.env.DASHBOARD_PASSWORD ?? 'AvinovaCorp2026_S'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.password !== 'string' || body.password !== body.confirmation || body.password !== dashboardPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('avinova-dashboard-access', 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return NextResponse.json({ ok: true })
}
