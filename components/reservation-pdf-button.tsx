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
  status: string
  createdAt: string | Date
}

function asDate(value: string | Date) {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00-05:00`) : new Date(value)
}

function formatValue(value: string | Date | number | null | undefined) {
  if (value === null || value === undefined || value === '') return 'No informado'
  if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
    const date = asDate(value)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        ...(value instanceof Date || (typeof value === 'string' && value.includes('T')) ? { timeStyle: 'short' as const } : {}),
        timeZone: 'America/Bogota',
      }).format(date)
    }
  }
  return String(value)
}

function formatWeek(value: string | Date) {
  const date = asDate(value)
  if (Number.isNaN(date.getTime())) return 'No disponible'
  const start = new Date(date)
  const weekday = start.getDay() || 7
  start.setDate(start.getDate() - weekday + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', timeZone: 'America/Bogota' })
  return `${formatter.format(start)} al ${formatter.format(end)} de ${end.getFullYear()}`
}

export function ReservationPdfButton({ reservation }: { reservation: ReservationPdfData }) {
  function downloadPdf() {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 18
    let y = 22

    pdf.setFillColor(253, 195, 3)
    pdf.rect(0, 0, 210, 34, 'F')
    pdf.setTextColor(40, 40, 40)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('AVINOVA | DETALLE DEL PEDIDO', margin, 17)
    pdf.setFontSize(10)
    pdf.text(`Pedido AV-${String(reservation.id).padStart(5, '0')}`, margin, 26)
    y = 46

    const fields: [string, string | Date | number | null | undefined][] = [
      ['Estado', ({ pending: 'Pendiente', confirmed: 'Confirmada', delivered: 'Entregada', cancelled: 'Cancelada' }[reservation.status] ?? reservation.status)],
      ['Fecha de creación', reservation.createdAt],
      ['Nombre del cliente', reservation.customerName],
      ['Correo electrónico', reservation.email],
      ['Teléfono', reservation.phone],
      ['Cantidad de cajas', reservation.quantity],
      ['Género', reservation.gender],
      ['Semana de entrega', formatWeek(reservation.deliveryDate)],
      ['Fecha de entrega', reservation.deliveryDate],
      ['Departamento', reservation.department],
      ['Ciudad', reservation.city],
      ['Dirección', reservation.address],
      ['Código postal', reservation.postalCode],
      ['Nombre de quien recibe', reservation.recipientName],
      ['Teléfono de quien recibe', reservation.recipientPhone],
      ['Comentarios adicionales', reservation.notes || 'Ninguno'],
    ]

    for (const [label, rawValue] of fields) {
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
