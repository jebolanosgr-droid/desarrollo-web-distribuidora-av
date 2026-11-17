type ReservationEmail = {
  id: number
  customerName: string
  email: string
  phone: string
  deliveryDate: string
  quantity: number
  gender: string
  department: string | null
  city: string | null
  address: string | null
  postalCode: string | null
  recipientName: string | null
  recipientPhone: string | null
  notes: string | null
  status: string
  createdAt: Date
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function formatWeek(value: string) {
  const start = new Date(`${value}T12:00:00`)
  if (Number.isNaN(start.getTime())) return value
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(start, end)
}

function row(label: string, value: string | number | null | undefined) {
  return `<tr><td style="padding:10px 12px;color:#655f5b;border-bottom:1px solid #eee7db">${escapeHtml(label)}</td><td style="padding:10px 12px;font-weight:600;border-bottom:1px solid #eee7db">${escapeHtml(value ? String(value) : 'No informado')}</td></tr>`
}

export async function sendReservationEmail(reservation: ReservationEmail, origin: string, recipientEmail: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const }

  const logoUrl = `${origin}/assets/img/logo/logo-avinova.png`
  const reference = `AV-${String(reservation.id).padStart(5, '0')}`
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#fff8eb;font-family:Arial,Helvetica,sans-serif;color:#282828"><main style="max-width:620px;margin:24px auto;background:#fff;padding:28px;border-radius:16px"><div style="padding-bottom:18px;border-bottom:3px solid #fdc303"><img src="${logoUrl}" width="150" alt="Avinova" style="display:block"><p style="margin:14px 0 0;color:#655f5b">Comprobante de reserva ${reference}</p></div><h1 style="font-size:24px;margin:24px 0 8px">Hola ${escapeHtml(reservation.customerName)}, recibimos tu reserva</h1><p style="color:#655f5b;line-height:1.6">Conserva este correo como referencia. Te notificaremos cuando el estado cambie.</p><table role="presentation" style="width:100%;border-collapse:collapse;margin:18px 0">${row('Identificador', reference)}${row('Fecha de creación', new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(reservation.createdAt))}${row('Semana de reserva', formatWeek(reservation.deliveryDate))}${row('Fecha de entrega', reservation.deliveryDate)}${row('Cantidad de cajas', reservation.quantity)}${row('Género', reservation.gender)}${row('Estado inicial', 'Pendiente')}${row('Correo de contacto', reservation.email)}${row('Teléfono', reservation.phone)}${row('Departamento', reservation.department)}${row('Ciudad', reservation.city)}${row('Dirección', reservation.address)}${row('Código postal', reservation.postalCode)}${row('Persona que recibe', reservation.recipientName)}${row('Teléfono de quien recibe', reservation.recipientPhone)}${row('Notas', reservation.notes)}</table><section style="padding:16px;background:#fff8eb;border-radius:12px"><strong>QR de pago</strong><div style="display:flex;align-items:center;gap:14px;margin-top:10px"><img src="${logoUrl}" width="84" height="84" alt="Logo temporal; QR de pago pendiente de reemplazo" style="object-fit:contain;background:white;padding:6px"><p style="margin:0;color:#655f5b;font-size:13px;line-height:1.5">Imagen temporal con el logo de Avinova. El QR de pago real está pendiente de reemplazo.</p></div></section><p style="margin:22px 0 6px">¿Necesitas ayuda?</p><a href="https://wa.me/REEMPLAZAR_NUMERO_DE_WHATSAPP" style="display:inline-block;padding:12px 18px;border-radius:24px;background:#fdc303;color:#282828;font-weight:700;text-decoration:none">Contactar por WhatsApp</a><p style="margin-top:24px;color:#777;font-size:12px">Este mensaje confirma la recepción de tu solicitud y no sustituye la confirmación final.</p></main></body></html>`

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [recipientEmail], subject: `Recibimos tu reserva ${reference} | Avinova`, html }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`)
  return { sent: true as const }
}
