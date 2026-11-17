'use client'

import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import './reserva.css'
import { OnboardingPage } from '@/components/onboarding/onboarding-page'
import { MotionObserver } from '@/components/motion/scroll-reveal'

const icons = {
  box: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bo-C6sLGwCNfwl3hEVo97MQHMFeS1vowv.png',
  calendar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ca-CWY6u6Qx6uWtVNK003UMYDBrPhi6Mu.png',
  people: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/peo-1scv5LdgvN95uQU3CDMfck8Zs2HKxJ.png',
  chick: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pollito-AjyPkWSOvQ9iLi0P75NW71OBBrusT1.png',
  male: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mal-3ACVwiCWoqKmW8jFY9NE5sKZu3rHSf.png',
  female: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fem-GMRV7mNTrSxT5wWSXOIkcW8ascuCno.png',
  door: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/do-Aps4JhMno4kgLLPpjIZ7RjQibXuWw3.png',
  facebook: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/face-wUw9FlAWGCl30KfzCb1PLjhHu5qETQ.png',
  whatsapp: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wha-cnq5QobRCw6DzGmCuHGkCAKNzkIgUr.png',
  instagram: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ins-5OX5340zS4gvAqkFjO08CLEBVcVNoA.png',
}

type Availability = {
  id: number
  weekStart: string
  totalBoxes: number
  maleBoxes: number
  femaleBoxes: number
  opensAt: string | null
  closesAt: string | null
  manualClosed: boolean
  reservedBoxes: number
  remainingBoxes: number
  reservedMaleBoxes: number
  remainingMaleBoxes: number
  reservedFemaleBoxes: number
  remainingFemaleBoxes: number
}
type AvailabilityResponse = { availability: Availability[] }
type Gender = 'Machos' | 'Hembras'

const fetcher = async (url: string): Promise<AvailabilityResponse> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('availability')
  return response.json()
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatWeek(value: string) {
  if (!value) return 'Sin semana configurada'
  const start = new Date(`${value}T12:00:00-05:00`)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' }).formatRange(start, end)
}

function Icon({ src, alt = '' }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} />
}

export default function ReservaPage() {
  const [weekValue, setWeekValue] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [gender, setGender] = useState<Gender>('Machos')
  const [comments, setComments] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [department, setDepartment] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(false)
  const { data: availabilityData, error: availabilityError, isLoading: availabilityLoading } = useSWR<AvailabilityResponse>('/api/availability', fetcher, { revalidateOnFocus: true })
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()

  useEffect(() => {
    if (!sessionPending && !session?.user) router.replace('/login?returnTo=/reserva')
  }, [router, session?.user, sessionPending])

  useEffect(() => {
    if (session?.user.email) setEmail(session.user.email)
  }, [session?.user.email])

  const weeks = availabilityData?.availability ?? []
  const activeWeek = weekValue ? weeks.find((item) => item.weekStart === weekValue) : weeks[0]
  const available = activeWeek?.remainingBoxes ?? 0
  const selectedAvailable = activeWeek
    ? gender === 'Machos' ? activeWeek.remainingMaleBoxes : activeWeek.remainingFemaleBoxes
    : 0
  const maxQuantity = Math.max(0, Math.min(100, available, selectedAvailable))
  const clampedQuantity = maxQuantity > 0 ? Math.min(quantity, maxQuantity) : 0
  const totalChicks = activeWeek ? clampedQuantity * 100 : null
  const isClosed = Boolean(
    !activeWeek || activeWeek.manualClosed ||
    (activeWeek.opensAt && new Date(activeWeek.opensAt).getTime() > Date.now()) ||
    (activeWeek.closesAt && new Date(activeWeek.closesAt).getTime() < Date.now()),
  )
  const weekEnd = activeWeek ? addDays(activeWeek.weekStart, 6) : ''
  const dateInWeek = Boolean(deliveryDate && activeWeek && deliveryDate >= activeWeek.weekStart && deliveryDate <= weekEnd)
  const canSubmit = Boolean(
    activeWeek && !isClosed && !availabilityError && !availabilityLoading &&
    customerName.trim() && phone.trim() && email && department.trim() && city.trim() && address.trim() &&
    dateInWeek && clampedQuantity > 0 && !submitting && !created,
  )
  const weekText = useMemo(() => formatWeek(activeWeek?.weekStart ?? ''), [activeWeek?.weekStart])

  const changeWeek = (value: string) => {
    setWeekValue(value)
    setQuantity(1)
    setDeliveryDate('')
    setError('')
    setSuccess('')
  }

  const submitReservation = async () => {
    setError('')
    setSuccess('')
    if (!customerName.trim() || !phone.trim() || !email || !department.trim() || !city.trim() || !address.trim() || !dateInWeek || !activeWeek) {
      setError('Completa nombre, teléfono y dirección, y selecciona una fecha dentro de la semana habilitada.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          deliveryDate,
          weekStart: activeWeek.weekStart,
          quantity: clampedQuantity,
          gender,
          department,
          city,
          address,
          postalCode,
          recipientName,
          recipientPhone,
          notes: comments,
        }),
      })
      const result = await response.json().catch(() => null)
      if (response.status === 401) {
        router.push('/login?returnTo=/reserva')
        return
      }
      if (!response.ok) {
        setError(result?.error ?? 'No pudimos guardar la reserva. Revisa los datos e inténtalo nuevamente.')
        return
      }

      setCreated(true)
      const notification = result?.emailStatus === 'sent'
        ? 'Enviamos una confirmación al correo de tu cuenta.'
        : 'La reserva quedó guardada. La notificación por correo está pendiente de configuración.'
      setSuccess(`Tu reserva se registró correctamente. ${notification}`)
    } catch {
      setError('No pudimos conectar con el servicio de reservas. Inténtalo nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionPending || !session?.user) return <main className="reserva-page reserva-auth-loading" aria-live="polite"><p>Verificando tu sesión…</p></main>

  return (
    <main className="reserva-page">
      <OnboardingPage tourId="reserva" />
      <MotionObserver />
      <section className="reserva-hero motion-reveal is-visible" data-tour="reservation-intro" aria-labelledby="reserva-title">
        <img src="/assets/img/placeholders/pollitos-montana.png" alt="Pollitos bebés en un campo frente a las montañas" />
        <div><h1 id="reserva-title">Reserva de pollitos</h1><p>Selecciona la cantidad de cajas, el género y la semana para<br className="desktop-only" /> asegurar tus pollitos de engorde.</p></div>
      </section>

      <section className="reserva-card motion-reveal is-visible">
        <div className="reserva-features" data-tour="reservation-features">
          <article><Icon src={icons.box} alt="" /><h2>Caja estándar</h2><p>100 pollitos aprox.</p></article>
          <article><Icon src={icons.calendar} alt="" /><h2>Reserva semanal</h2><p>Se habilita cada<br />inicio de semana.</p></article>
          <article><Icon src={icons.people} alt="" /><h2>Capacidad semanal</h2><p>Consulta las cajas<br />disponibles abajo.</p></article>
          <article><Icon src={icons.chick} alt="" /><h2>Pollitos de engorde</h2><p>Sin razas. Solo machos<br />o hembras (según<br />disponibilidad).</p></article>
        </div>

        <div className="reserva-layout">
          <section className="reserva-form motion-reveal" aria-label="Formulario de reserva">
            <div className="reserva-availability-heading"><h2>Disponibilidad de cajas</h2><label>Semana <select value={activeWeek?.weekStart ?? ''} onChange={(event) => changeWeek(event.target.value)} disabled={availabilityLoading || weeks.length === 0}><option value="">Selecciona una semana</option>{weeks.map((item) => <option key={item.weekStart} value={item.weekStart}>{formatWeek(item.weekStart)}{item.manualClosed ? ' — Cerrada' : ''}</option>)}</select></label></div>
            {availabilityLoading && <p role="status">Cargando disponibilidad…</p>}
            {availabilityError && <p className="reserva-error" role="alert">No pudimos consultar la disponibilidad. Inténtalo nuevamente más tarde.</p>}
            {!availabilityLoading && !availabilityError && weeks.length === 0 && <p className="reserva-warning" role="status">No hay semanas habilitadas para reservar.</p>}
            {activeWeek && isClosed && <p className="reserva-warning" role="status">Las reservas están cerradas para esta semana.</p>}
            {activeWeek && available === 0 && !isClosed && <p className="reserva-warning" role="status">No quedan cajas disponibles para esta semana.</p>}
            <div className="reserva-stats"><div><span>Total de cajas</span><strong>{activeWeek?.totalBoxes ?? '—'}</strong></div><div><span>Reservadas</span><strong>{activeWeek?.reservedBoxes ?? '—'}</strong></div><div><span>Disponibles</span><strong>{activeWeek?.remainingBoxes ?? '—'}</strong></div></div>

            <fieldset className="reserva-fieldset"><legend>Selecciona la cantidad de cajas</legend><div className="reserva-counter"><button type="button" aria-label="Disminuir cantidad" onClick={() => setQuantity(Math.max(1, clampedQuantity - 1))} disabled={!maxQuantity}>−</button><output aria-live="polite">{activeWeek ? clampedQuantity : '—'}</output><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity(Math.min(maxQuantity, clampedQuantity + 1))} disabled={!maxQuantity || clampedQuantity >= maxQuantity}>+</button></div><p>Cada caja contiene aprox. 100 pollitos.</p></fieldset>

            <fieldset className="reserva-fieldset"><legend>Selecciona el género</legend><div className="reserva-genders"><label className={gender === 'Machos' ? 'selected' : ''}><input type="radio" name="genero" value="Machos" checked={gender === 'Machos'} onChange={() => setGender('Machos')} /><Icon src={icons.male} alt="" /><span><strong>Machos</strong><small>Disponibles: {activeWeek?.remainingMaleBoxes ?? '—'} cajas</small></span></label><label className={gender === 'Hembras' ? 'selected' : ''}><input type="radio" name="genero" value="Hembras" checked={gender === 'Hembras'} onChange={() => setGender('Hembras')} /><Icon src={icons.female} alt="" /><span><strong>Hembras</strong><small>Disponibles: {activeWeek?.remainingFemaleBoxes ?? '—'} cajas</small></span></label></div></fieldset>

            <fieldset className="reserva-fieldset"><legend>Dirección de entrega</legend><div className="reserva-inputs"><label><span className="sr-only">Nombre completo</span><input required maxLength={120} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nombre completo" /></label><label><span className="sr-only">Teléfono</span><input required maxLength={32} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Teléfono" /></label><label><span className="sr-only">Correo electrónico de tu cuenta</span><input required type="email" value={email} readOnly aria-readonly="true" placeholder="Correo electrónico" /></label><label><span className="sr-only">Fecha de entrega</span><input required type="date" min={activeWeek?.weekStart} max={weekEnd} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} disabled={!activeWeek || isClosed} /></label><label><span className="sr-only">Departamento</span><input required maxLength={100} value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Departamento" /></label><label><span className="sr-only">Ciudad</span><input required maxLength={100} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ciudad" /></label><label><span className="sr-only">Dirección</span><input required maxLength={180} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Dirección" /></label><label><span className="sr-only">Código postal</span><input maxLength={20} value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="Código postal" /></label><label><span className="sr-only">Nombre de quien recibe (opcional)</span><input maxLength={120} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Nombre de quien recibe (opcional)" /></label><label><span className="sr-only">Teléfono de quien recibe (opcional)</span><input maxLength={32} value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} placeholder="Teléfono de quien recibe (opcional)" /></label></div></fieldset>

            <label className="reserva-comments">Comentarios adicionales <span>(opcional)</span><textarea maxLength={200} value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Escribe algún comentario especial sobre tu reserva..." /><small>{comments.length}/200</small></label>
            {error && <p className="reserva-error" role="alert">{error}</p>}
            {success && <p className="reserva-warning" role="status">{success}</p>}
            {success && <a className="reserva-submit" href="/mis-pedidos"><span>Ver mis pedidos</span><Icon src={icons.calendar} alt="" /></a>}
            {!success && <button className="reserva-submit" type="button" disabled={!canSubmit} onClick={submitReservation}><span>{submitting ? 'Guardando reserva…' : 'Confirmar reserva'}</span><Icon src={icons.calendar} alt="" /></button>}
          </section>

          <aside className="reserva-summary motion-reveal"><h2><Icon src={icons.calendar} alt="" />Información de tu pedido</h2><dl><div><dt>Semana</dt><dd>{weekText}</dd></div><div><dt>Cantidad de cajas:</dt><dd>{activeWeek ? clampedQuantity : '—'}</dd></div><div><dt>Género:</dt><dd>{gender}</dd></div><div><dt>Total de pollitos (aprox.):</dt><dd>{totalChicks ?? '—'}</dd></div></dl><p className="reserva-notice"><Icon src={icons.door} alt="" />Tu reserva será confirmada vía correo electrónico y/o WhatsApp en un plazo de 24 horas.</p></aside>
        </div>

        <section className="reserva-help"><Icon src={icons.chick} alt="" /><div><h2>¿Tienes dudas?</h2><p>Si necesitas más información sobre nuestras reservas, contáctanos. Estamos para ayudarte.</p></div><div className="reserva-socials"><a href="https://facebook.com" aria-label="Facebook"><Icon src={icons.facebook} /></a><a href="https://wa.me/573205135667" aria-label="WhatsApp"><Icon src={icons.whatsapp} /></a><a href="https://instagram.com" aria-label="Instagram"><Icon src={icons.instagram} /></a></div></section>
      </section>
    </main>
  )
}
