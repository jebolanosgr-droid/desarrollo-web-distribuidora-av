import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createDashboardSessionToken,
  DASHBOARD_ACCESS_COOKIE,
  DASHBOARD_SESSION_SECONDS,
  isDashboardPasswordConfigured,
  verifyDashboardPassword,
} from '@/lib/dashboard-access'

export async function POST(request: Request) {
  if (!isDashboardPasswordConfigured()) {
    return NextResponse.json({ error: 'El acceso administrativo aún no está configurado en Render.' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password || !verifyDashboardPassword(password)) {
    return NextResponse.json({ error: 'La contraseña del administrador no es válida.' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(DASHBOARD_ACCESS_COOKIE, createDashboardSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'strict',
    path: '/',
    maxAge: DASHBOARD_SESSION_SECONDS,
  })

  return NextResponse.json({ ok: true })
}
