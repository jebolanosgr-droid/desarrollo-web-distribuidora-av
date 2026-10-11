import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, service: 'avinova', database: 'disconnected' }, { status: 503 })
  }

  try {
    await db.execute(sql`SELECT 1`)
    return NextResponse.json({ ok: true, service: 'avinova', database: 'connected' })
  } catch {
    return NextResponse.json({ ok: false, service: 'avinova', database: 'disconnected' }, { status: 503 })
  }
}
