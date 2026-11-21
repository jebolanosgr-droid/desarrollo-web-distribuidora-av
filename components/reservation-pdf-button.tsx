'use client'

import { createReservationPdf, type ReservationPdfData } from '@/components/reservation-pdf'

type ReceiptAssets = {
  logoDataUrl: string
  regularFont: string
  semiboldFont: string
  boldFont: string
}

let receiptAssetsPromise: Promise<ReceiptAssets> | null = null

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

async function fetchAsset(path: string, mimeType?: string) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`No se pudo cargar el recurso del comprobante: ${path}`)
  const base64 = arrayBufferToBase64(await response.arrayBuffer())
  return mimeType ? `${mimeType};base64,${base64}` : base64
}

function loadReceiptAssets() {
  if (!receiptAssetsPromise) {
    receiptAssetsPromise = Promise.all([
      fetchAsset('/assets/img/logo/avinova-receipt-logo.png', 'data:image/png'),
      fetchAsset('/assets/fonts/Inter-Regular.ttf'),
      fetchAsset('/assets/fonts/Inter-SemiBold.ttf'),
      fetchAsset('/assets/fonts/Inter-Bold.ttf'),
    ]).then(([logoDataUrl, regularFont, semiboldFont, boldFont]) => ({
      logoDataUrl,
      regularFont,
      semiboldFont,
      boldFont,
    })).catch((error: unknown) => {
      receiptAssetsPromise = null
      throw error
    })
  }
  return receiptAssetsPromise
}

export function ReservationPdfButton({ reservation }: { reservation: ReservationPdfData }) {
  async function downloadPdf() {
    const pdf = createReservationPdf(reservation, await loadReceiptAssets())
    pdf.save(`pedido-AV-${String(reservation.id).padStart(5, '0')}.pdf`)
  }

  return <button type="button" className="reservation-pdf-button" onClick={downloadPdf}>Descargar PDF</button>
}
