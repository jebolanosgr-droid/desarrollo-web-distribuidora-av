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
