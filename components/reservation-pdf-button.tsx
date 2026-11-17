'use client'

import { jsPDF } from 'jspdf'

type ReservationPdfData = {
  id: number
  customerName: string
  email: string
  phone: string
  deliveryDate: string | Date
  quantity: number
  gender: string
  department?: string | null
  city?: string | null
  address?: string | null
  postalCode?: string | null
  recipientName?: string | null
  recipientPhone?: string | null
  notes?: string | null
  cancellationRequestedAt?: string | Date | null
  status: string
  createdAt: string | Date
}

function formatWeek(value: string | Date) {
  const date = new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
  if (Number.isNaN(date.getTime())) return 'No informado'
  const start = new Date(date)
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(start, end)
}

function formatValue(value: string | Date | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'No informado'
  if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
    const date = new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', ...(value instanceof Date || value.includes('T') ? { timeStyle: 'short' as const } : {}) }).format(date)
  }
  return String(value)
}

export function ReservationPdfButton({ reservation }: { reservation: ReservationPdfData }) {
  async function downloadPdf() {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 18
    let y = 22

    pdf.setFillColor(253, 195, 3)
    pdf.rect(0, 0, 210, 34, 'F')
    pdf.setTextColor(40, 40, 40)
    try {
      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      logo.src = '/assets/img/logo/logo-avinova.png'
      await new Promise<void>((resolve, reject) => { logo.onload = () => resolve(); logo.onerror = () => reject(new Error('No se pudo cargar el logo')) })
      const canvas = document.createElement('canvas')
      canvas.width = logo.naturalWidth
      canvas.height = logo.naturalHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(logo, 0, 0)
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, 7, 27, 20)
      }
    } catch {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('AVINOVA', margin, 15)
    }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('COMPROBANTE DE RESERVA', 52, 17)
    pdf.setFontSize(10)
    pdf.text(`Pedido AV-${String(reservation.id).padStart(5, '0')}`, 52, 26)
    y = 46

    const fields: [string, string | Date | number | null | undefined][] = [
      ['Estado', ({ pending: 'Pendiente', confirmed: 'Confirmada', delivered: 'Entregada', cancelled: 'Cancelada' }[reservation.status] ?? reservation.status)],
      ['Fecha de creación', reservation.createdAt],
      ['Nombre del cliente', reservation.customerName],
      ['Correo electrónico', reservation.email],
      ['Teléfono', reservation.phone],
      ['Cantidad de cajas', reservation.quantity],
      ['Género', reservation.gender],
      ['Fecha de entrega', reservation.deliveryDate],
      ['Semana de reserva', formatWeek(reservation.deliveryDate)],
      ['Departamento', reservation.department],
      ['Ciudad', reservation.city],
      ['Dirección', reservation.address],
      ['Código postal', reservation.postalCode],
      ['Nombre de quien recibe', reservation.recipientName],
      ['Teléfono de quien recibe', reservation.recipientPhone],
      ['Solicitud de cancelación', reservation.cancellationRequestedAt ? `Solicitada el ${formatValue(reservation.cancellationRequestedAt)}` : 'No solicitada'],
      ['Comentarios adicionales', reservation.notes || 'Ninguno'],
    ]

    for (const [index, [label, rawValue]] of fields.entries()) {
      const sectionTitle = index === 0 ? 'DETALLES DE LA RESERVA' : index === 2 ? 'DATOS DEL CLIENTE' : index === 7 ? 'INFORMACIÓN DE ENTREGA' : index === 16 ? 'OBSERVACIONES' : null
      if (sectionTitle) {
        if (y + 12 > pageHeight - margin) { pdf.addPage(); y = margin }
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.setTextColor(126, 92, 0)
        pdf.text(sectionTitle, margin, y)
        pdf.setTextColor(40, 40, 40)
        y += 8
      }
      const valueLines = pdf.splitTextToSize(formatValue(rawValue), 126) as string[]
      const blockHeight = Math.max(8, valueLines.length * 5 + 3)
      if (y + blockHeight > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text(`${label}:`, margin, y)
      pdf.setFont('helvetica', 'normal')
      pdf.text(valueLines, 64, y)
      y += blockHeight
      pdf.setDrawColor(232, 226, 216)
      pdf.line(margin, y - 2, 192, y - 2)
    }

    pdf.save(`pedido-AV-${String(reservation.id).padStart(5, '0')}.pdf`)
  }

  return <button type="button" className="reservation-pdf-button" onClick={downloadPdf}>Descargar PDF</button>
}
