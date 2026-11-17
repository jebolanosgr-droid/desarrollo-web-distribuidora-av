import 'server-only'

import { addDaysToDateOnly } from '@/lib/reservation-availability'

export type ReservationEmailData = {
  id: number
  customerName: string
  email: string
  phone: string
  deliveryDate: string
  weekStart: string
  quantity: number
  gender: string
  department: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  recipientName: string | null
  recipientPhone: string | null
  notes: string | null
}

export type ReservationEmailStatus = 'sent' | 'not_configured' | 'failed'

function escapeHtml(value: string | number | null | undefined) {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return String(value ?? 'No informado').replace(/[&<>"']/g, (character) => entities[character])
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00-05:00`)
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }).format(date)
}

function getPublicOrigin() {
  const candidate = process.env.RENDER_EXTERNAL_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return null
    return url.origin
  } catch {
    return null
  }
}

function createEmailHtml(reservation: ReservationEmailData, isAdminCopy: boolean) {
  const weekEnd = addDaysToDateOnly(reservation.weekStart, 6)
  const configuredWhatsapp = process.env.WHATSAPP_CONTACT_URL?.trim() || 'https://wa.me/REEMPLAZAR_NUMERO_DE_WHATSAPP'
  let whatsapp = new URL('https://wa.me/REEMPLAZAR_NUMERO_DE_WHATSAPP')
  try {
    const candidate = new URL(configuredWhatsapp)
    if (candidate.protocol === 'https:' && (candidate.hostname === 'wa.me' || candidate.hostname === 'api.whatsapp.com')) whatsapp = candidate
  } catch {
    whatsapp = new URL('https://wa.me/REEMPLAZAR_NUMERO_DE_WHATSAPP')
  }
  whatsapp.searchParams.set('text', `Hola, tengo una consulta sobre la reserva AV-${reservation.id}.`)
  const origin = getPublicOrigin()
  const qrImageUrl = origin ? new URL('/assets/img/qr-pago-placeholder.png', origin).toString() : null
  const rows: Array<[string, string | number | null]> = [
    ['Pedido', `AV-${String(reservation.id).padStart(5, '0')}`],
    ['Cliente', reservation.customerName],
    ['Correo', reservation.email],
    ['Teléfono', reservation.phone],
    ['Semana', `${formatDate(reservation.weekStart)} al ${formatDate(weekEnd)}`],
    ['Fecha de entrega', formatDate(reservation.deliveryDate)],
    ['Cantidad de cajas', reservation.quantity],
    ['Género', reservation.gender],
    ['Departamento', reservation.department],
    ['Ciudad', reservation.city],
    ['Dirección', reservation.address],
    ['Código postal', reservation.postalCode],
    ['Persona que recibe', reservation.recipientName],
    ['Teléfono de quien recibe', reservation.recipientPhone],
    ['Comentarios', reservation.notes || 'Ninguno'],
  ]
  const tableRows = rows.map(([label, value]) => `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`).join('')
  const title = isAdminCopy ? 'Nueva reserva recibida' : 'Recibimos tu reserva'
  const introduction = isAdminCopy
    ? 'Se registró una nueva reserva en Avinova. Revisa los datos y contacta al cliente para confirmar la entrega.'
    : 'Tu solicitud quedó registrada. El equipo de Avinova se pondrá en contacto contigo para confirmar disponibilidad y entrega.'
  const qrSection = qrImageUrl
    ? `<h2 style="font-size:18px;margin:24px 0 8px">Información de pago</h2><p>El QR es un marcador temporal y debe reemplazarse por el QR de pago real antes de usarlo.</p><img src="${escapeHtml(qrImageUrl)}" width="220" height="220" alt="QR de pago pendiente de reemplazar por el QR real" style="display:block;max-width:100%;height:auto">`
    : '<h2 style="font-size:18px;margin:24px 0 8px">Información de pago</h2><p>El QR de pago está pendiente de configuración. No realices pagos con este correo; contacta al equipo para confirmar los datos.</p>'

  return `<!doctype html><html lang="es"><body style="margin:0;background:#ffefd4;color:#282828;font-family:Arial,sans-serif"><main style="max-width:680px;margin:24px auto;padding:28px;background:#fffef3;border-radius:18px"><p style="color:#8a6800;font-weight:700">AVINOVA</p><h1 style="font-size:24px">${title}</h1><p>${introduction}</p><table style="width:100%;border-collapse:collapse">${tableRows}</table>${qrSection}<p style="margin-top:24px"><a href="${escapeHtml(whatsapp.toString())}" style="display:inline-block;padding:12px 18px;background:#fdc303;color:#282828;text-decoration:none;border-radius:24px;font-weight:700">Contactar por WhatsApp</a></p><p style="font-size:12px;color:#666">Este mensaje contiene datos de una reserva. Compártelo únicamente con las personas encargadas de gestionarla.</p></main></body></html>`
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string, idempotencyKey: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    console.error('[reservation-email] Provider rejected a notification.', { status: response.status })
    return false
  }

  return true
}

export async function sendReservationEmails(reservation: ReservationEmailData): Promise<ReservationEmailStatus> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'jebolanosgr@ut.edu.co'
  if (!apiKey || !from) return 'not_configured'

  const customerHtml = createEmailHtml(reservation, false)
  const adminHtml = createEmailHtml(reservation, true)
  try {
    const [customerSent, adminSent] = await Promise.all([
      sendEmail(apiKey, from, reservation.email, `Reserva AV-${reservation.id} recibida`, customerHtml, `reservation-${reservation.id}-customer`),
      sendEmail(apiKey, from, adminEmail, `Nueva reserva AV-${reservation.id}`, adminHtml, `reservation-${reservation.id}-admin`),
    ])
    return customerSent && adminSent ? 'sent' : 'failed'
  } catch {
    console.error('[reservation-email] Unable to deliver reservation notifications.')
    return 'failed'
  }
}
