import { jsPDF } from 'jspdf'

export type ReservationPdfData = {
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

type ReservationPdfAssets = {
  logoDataUrl: string
  regularFont: string
  semiboldFont: string
  boldFont: string
}

type ReceiptRow = {
  label: string
  value: string
}

type PreparedRow = ReceiptRow & {
  labelLines: string[]
  valueLines: string[]
  height: number
}

const COLORS = {
  ink: [40, 40, 40] as const,
  secondary: [63, 59, 59] as const,
  value: [91, 87, 83] as const,
  gold: [164, 120, 0] as const,
  goldShape: [193, 145, 18] as const,
  yellow: [253, 195, 3] as const,
}

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 18
const LABEL_X = MARGIN
const VALUE_X = 83
const VALUE_WIDTH = PAGE_WIDTH - MARGIN - VALUE_X
const BOTTOM = PAGE_HEIGHT - MARGIN
const BODY_FONT_SIZE = 9.5
const LINE_HEIGHT = BODY_FONT_SIZE * 1.22 * 25.4 / 72
const ROW_GAP = 1.8
const SECTION_TITLE_HEIGHT = 5.8

function emptyValue(value: unknown) {
  if (value === null || value === undefined) return true
  return typeof value === 'string' && value.trim().length === 0
}

function displayValue(value: unknown) {
  return emptyValue(value) ? 'No registrado' : String(value)
}

function toCalendarDate(value: string | Date) {
  if (typeof value === 'string') {
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (dateParts) return new Date(Date.UTC(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])))
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function formatDate(value: string | Date | null | undefined, includeTime = false) {
  if (value === null || value === undefined || value === '') return 'No registrado'
  const containsTime = value instanceof Date || (typeof value === 'string' && /T\d{2}:\d{2}/.test(value))
  const date = includeTime && containsTime
    ? (value instanceof Date ? value : new Date(value))
    : toCalendarDate(value)
  if (!date || Number.isNaN(date.getTime())) return 'No registrado'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    ...(includeTime && containsTime ? { timeStyle: 'short' as const, timeZone: 'America/Bogota' } : { timeZone: 'UTC' }),
  }).format(date)
}

function formatWeek(value: string | Date) {
  const start = toCalendarDate(value)
  if (!start) return 'No registrado'
  const day = start.getUTCDay() || 7
  start.setUTCDate(start.getUTCDate() - day + 1)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatRange(start, end)
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
  }
  return labels[status.trim().toLowerCase()] ?? displayValue(status)
}

function formatGender(gender: string | null | undefined) {
  if (emptyValue(gender)) return 'No registrado'
  const normalized = String(gender).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
  if (['macho', 'machos', 'male', 'masculino', 'm'].includes(normalized)) return 'Macho'
  if (['hembra', 'hembras', 'female', 'femenino', 'f'].includes(normalized)) return 'Hembra'
  return String(gender)
}

function formatQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 'No registrado'
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Math.trunc(quantity))
}

function reservationSections(reservation: ReservationPdfData) {
  return [
    {
      title: 'DETALLES DE LA RESERVA',
      rows: [
        { label: 'Estado', value: formatStatus(reservation.status) },
        { label: 'Fecha de creación', value: formatDate(reservation.createdAt, true) },
      ],
    },
    {
      title: 'DATOS DEL CLIENTE',
      rows: [
        { label: 'Nombre del cliente', value: displayValue(reservation.customerName) },
        { label: 'Correo electrónico', value: displayValue(reservation.email) },
        { label: 'Teléfono', value: displayValue(reservation.phone) },
        { label: 'Cantidad de cajas', value: formatQuantity(reservation.quantity) },
        { label: 'Sexo', value: formatGender(reservation.gender) },
      ],
    },
    {
      title: 'INFORMACIÓN DE LA ENTREGA',
      rows: [
        { label: 'Fecha de entrega', value: formatDate(reservation.deliveryDate) },
        { label: 'Semana de reserva', value: formatWeek(reservation.deliveryDate) },
        { label: 'Departamento', value: displayValue(reservation.department) },
        { label: 'Ciudad', value: displayValue(reservation.city) },
        { label: 'Dirección', value: displayValue(reservation.address) },
        { label: 'Nombre de quien recibe', value: displayValue(reservation.recipientName) },
        { label: 'Teléfono de quien recibe', value: displayValue(reservation.recipientPhone) },
        {
          label: 'Solicitud de cancelación',
          value: reservation.cancellationRequestedAt
            ? `Solicitada el ${formatDate(reservation.cancellationRequestedAt, true)}`
            : 'No solicitada',
        },
      ],
    },
    {
      title: 'OBSERVACIONES',
      rows: [
        {
          label: 'Comentarios adicionales',
          value: emptyValue(reservation.notes) ? 'Sin comentarios adicionales' : String(reservation.notes),
        },
      ],
    },
  ]
}

function prepareRow(pdf: jsPDF, row: ReceiptRow): PreparedRow {
  pdf.setFont('Inter', 'semibold')
  pdf.setFontSize(BODY_FONT_SIZE)
  const labelLines = pdf.splitTextToSize(`${row.label}:`, VALUE_X - LABEL_X - 8) as string[]
  pdf.setFont('Inter', 'normal')
  const valueLines = pdf.splitTextToSize(row.value, VALUE_WIDTH) as string[]
  return {
    ...row,
    labelLines,
    valueLines,
    height: Math.max(labelLines.length, valueLines.length) * LINE_HEIGHT + ROW_GAP,
  }
}

function setSectionHeading(pdf: jsPDF, title: string, y: number) {
  pdf.setFont('Inter', 'bold')
  pdf.setFontSize(9.7)
  pdf.setTextColor(...COLORS.gold)
  pdf.text(title, MARGIN, y)
}

function drawRow(pdf: jsPDF, row: PreparedRow, y: number, label = `${row.label}:`, valueLines = row.valueLines) {
  pdf.setFont('Inter', 'semibold')
  pdf.setFontSize(BODY_FONT_SIZE)
  pdf.setTextColor(...COLORS.secondary)
  pdf.text(row.labelLines.length > 1 ? row.labelLines : label, LABEL_X, y, { lineHeightFactor: 1.22 })
  pdf.setFont('Inter', 'normal')
  pdf.setTextColor(...COLORS.value)
  pdf.text(valueLines, VALUE_X, y, { lineHeightFactor: 1.22 })
}

function drawHeader(pdf: jsPDF, reservation: ReservationPdfData, logoDataUrl: string) {
  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

  pdf.setFillColor(...COLORS.goldShape)
  pdf.ellipse(192, 22, 51, 31, 'F')
  pdf.ellipse(161, 38, 25, 16, 'F')

  pdf.setFillColor(...COLORS.yellow)
  pdf.ellipse(207, 45, 37, 19, 'F')
  pdf.ellipse(181, 52, 17, 9, 'F')

  pdf.setFillColor(...COLORS.ink)
  pdf.ellipse(192, -1, 27, 13, 'F')
  pdf.ellipse(213, 6, 11, 7, 'F')

  pdf.addImage(logoDataUrl, 'PNG', 169, 14, 28, 23.85)

  pdf.setFont('Inter', 'bold')
  pdf.setFontSize(28)
  pdf.setTextColor(...COLORS.ink)
  pdf.text('Comprobante', MARGIN, 33)

  pdf.setFont('Inter', 'semibold')
  pdf.setFontSize(12.5)
  pdf.setTextColor(...COLORS.value)
  pdf.text('De reserva en línea', MARGIN, 42.5)

  pdf.setFont('Inter', 'normal')
  pdf.setFontSize(9.2)
  pdf.setTextColor(...COLORS.secondary)
  pdf.text(`Pedido AV-${String(reservation.id).padStart(5, '0')}`, MARGIN, 51)
}

export function createReservationPdf(reservation: ReservationPdfData, assets: ReservationPdfAssets) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', putOnlyUsedFonts: true })
  pdf.addFileToVFS('Inter-Regular.ttf', assets.regularFont)
  pdf.addFont('Inter-Regular.ttf', 'Inter', 'normal')
  pdf.addFileToVFS('Inter-SemiBold.ttf', assets.semiboldFont)
  pdf.addFont('Inter-SemiBold.ttf', 'Inter', 'semibold')
  pdf.addFileToVFS('Inter-Bold.ttf', assets.boldFont)
  pdf.addFont('Inter-Bold.ttf', 'Inter', 'bold')

  drawHeader(pdf, reservation, assets.logoDataUrl)

  let y = 69
  const sections = reservationSections(reservation)

  for (const section of sections) {
    const preparedRows = section.rows.map((row) => prepareRow(pdf, row))
    const sectionSpace = 3.6 + SECTION_TITLE_HEIGHT + (preparedRows[0]?.height ?? 0)
    if (y + sectionSpace > BOTTOM) {
      pdf.addPage()
      y = MARGIN
    } else {
      y += 3.6
    }

    setSectionHeading(pdf, section.title, y)
    y += SECTION_TITLE_HEIGHT

    for (const row of preparedRows) {
      const availableHeight = BOTTOM - y
      const fullPageHeight = BOTTOM - MARGIN - SECTION_TITLE_HEIGHT

      if (row.height <= fullPageHeight && row.height > availableHeight) {
        pdf.addPage()
        y = MARGIN
        setSectionHeading(pdf, section.title, y)
        y += SECTION_TITLE_HEIGHT
      }

      if (row.height <= BOTTOM - y) {
        drawRow(pdf, row, y)
        y += row.height
        continue
      }

      let lineIndex = 0
      let firstChunk = true
      while (lineIndex < row.valueLines.length) {
        const linesAvailable = Math.max(1, Math.floor((BOTTOM - y - ROW_GAP) / LINE_HEIGHT))
        const lineCount = Math.min(linesAvailable, row.valueLines.length - lineIndex)
        const valueLines = row.valueLines.slice(lineIndex, lineIndex + lineCount)
        const label = firstChunk ? `${row.label}:` : 'Continuación:'
        drawRow(pdf, row, y, label, valueLines)
        y += lineCount * LINE_HEIGHT + ROW_GAP
        lineIndex += lineCount
        firstChunk = false

        if (lineIndex < row.valueLines.length) {
          pdf.addPage()
          y = MARGIN
          setSectionHeading(pdf, `${section.title} · CONTINUACIÓN`, y)
          y += SECTION_TITLE_HEIGHT
        }
      }
    }
  }

  return pdf
}
