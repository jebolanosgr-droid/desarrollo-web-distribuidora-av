import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

async function sendPasswordResetEmail(email: string, name: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error('Password reset email is not configured.')

  const safeName = escapeHtml(name || 'cliente')
  const safeUrl = escapeHtml(url)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Recupera tu contraseña | Avinova',
      html: `<!doctype html><html lang="es"><body style="margin:0;background:#fff8eb;font-family:Arial,Helvetica,sans-serif;color:#282828"><main style="max-width:560px;margin:24px auto;background:#fff;padding:32px;border-radius:18px"><p style="color:#655f5b">Avinova · Acceso seguro</p><h1 style="font-size:24px">Hola ${safeName}</h1><p style="line-height:1.6">Recibimos una solicitud para cambiar la contraseña de tu cuenta. Usa el botón para elegir una nueva contraseña.</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fdc303;color:#282828;text-decoration:none;font-weight:700">Crear nueva contraseña</a></p><p style="font-size:13px;line-height:1.6;color:#655f5b">Si no solicitaste este cambio, puedes ignorar este mensaje.</p></main></body></html>`,
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Password reset email provider returned ${response.status}`)
}

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.RENDER_EXTERNAL_URL ? process.env.RENDER_EXTERNAL_URL : process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordResetEmail(user.email, user.name, url)
      } catch (error) {
        console.error('[auth] No se pudo enviar el correo para restablecer contraseña:', error)
      }
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []), ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []), ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []), ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : [])] : []),
    ...(process.env.NODE_ENV === 'production' ? [ ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []), ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []), ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []) ] : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
