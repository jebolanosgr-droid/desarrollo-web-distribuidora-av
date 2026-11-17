import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const DASHBOARD_ACCESS_COOKIE = 'avinova-dashboard-access'
export const DASHBOARD_SESSION_SECONDS = 8 * 60 * 60
const TOKEN_VERSION = 'v1'
const MINIMUM_PASSWORD_LENGTH = 16

function getDashboardSecret() {
  const secret = process.env.DASHBOARD_PASSWORD
  return secret && secret.length >= MINIMUM_PASSWORD_LENGTH ? secret : null
}

export function isDashboardPasswordConfigured() {
  return getDashboardSecret() !== null
}

export function verifyDashboardPassword(candidate: string) {
  const secret = getDashboardSecret()
  if (!secret || candidate.length > 512) return false

  const expected = Buffer.from(secret)
  const actual = Buffer.from(candidate)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function createDashboardSessionToken(now = Date.now()) {
  const secret = getDashboardSecret()
  if (!secret) throw new Error('Dashboard access is not configured.')

  const expiresAt = String(now + DASHBOARD_SESSION_SECONDS * 1000)
  const payload = `${TOKEN_VERSION}.${expiresAt}`
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export async function hasDashboardAccess() {
  const secret = getDashboardSecret()
  if (!secret) return false

  const cookieStore = await cookies()
  const token = cookieStore.get(DASHBOARD_ACCESS_COOKIE)?.value
  if (!token) return false

  const [version, expiresAt, signature, extra] = token.split('.')
  if (version !== TOKEN_VERSION || !expiresAt || !signature || extra !== undefined) return false

  const expiration = Number(expiresAt)
  if (!Number.isSafeInteger(expiration) || expiration <= Date.now()) return false

  const expected = createHmac('sha256', secret).update(`${version}.${expiresAt}`).digest()
  const actual = Buffer.from(signature, 'base64url')
  return actual.length === expected.length && timingSafeEqual(expected, actual)
}
