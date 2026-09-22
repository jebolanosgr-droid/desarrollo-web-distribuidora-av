'use client'

import { useMemo, useState } from 'react'
import './reserva.css'

const icons = {
  box: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bo-C6sLGwCNfwl3hEVo97MQHMFeS1vowv.png',
  calendar: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ca-CWY6u6Qx6uWtVNK003UMYDBrPhi6Mu.png',
  people: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/peo-1scv5LdgvN95uQU3CDMfck8Zs2HKxJ.png',
  chick: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pollito-AjyPkWSOvQ9iLi0P75NW71OBBrusT1.png',
  male: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mal-3ACVwiCWoqKmW8jFY9NE5sKZu3rHSf.png',
  female: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fem-GMRV7mNTrSxT5wWSXOIkcW8ascuCno.png',
  location: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ubi-IYThDHKSsZNV1yOZrpoN1XTehTxUXE.png',
  door: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/do-Aps4JhMno4kgLLPpjIZ7RjQibXuWw3.png',
  facebook: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/face-wUw9FlAWGCl30KfzCb1PLjhHu5qETQ.png',
  whatsapp: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wha-cnq5QobRCw6DzGmCuHGkCAKNzkIgUr.png',
  instagram: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ins-5OX5340zS4gvAqkFjO08CLEBVcVNoA.png',
}

const weeks = [
  { value: '14-20', label: '14 - 20 de abril de 2025', total: 100, reserved: 68, males: 16, females: 16 },
  { value: '21-27', label: '21 - 27 de abril de 2025', total: 80, reserved: 30, males: 25, females: 25 },
]

function Icon({ src, alt = '' }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} />
}

export default function ReservaPage() {
  const [weekValue, setWeekValue] = useState(weeks[0].value)
  const [quantity, setQuantity] = useState(1)
  const [gender, setGender] = useState('Machos')
  const [comments, setComments] = useState('')
  const week = weeks.find((item) => item.value === weekValue) ?? weeks[0]
  const available = week.total - week.reserved
  const selectedAvailable = gender === 'Machos' ? week.males : week.females
  const maxQuantity = Math.max(1, Math.min(available, selectedAvailable))
  const clampedQuantity = Math.min(quantity, maxQuantity)
  const totalChicks = clampedQuantity * 100
  const canSubmit = clampedQuantity > 0 && selectedAvailable >= clampedQuantity
  const weekText = useMemo(() => week.label, [week.label])

  const changeWeek = (value: string) => {
    setWeekValue(value)
    setQuantity(1)
  }

  return (
    <main className="reserva-page">
      <header className="reserva-header">
        <a className="reserva-brand" href="/" aria-label="Avinova inicio"><img src="/assets/img/logo/logo-avinova.png" alt="Avinova" /></a>
        <nav aria-label="Navegación principal"><a href="/">Inicio</a><a href="/#nosotros">Conócenos</a><a className="active" href="/reserva">Reserva</a><a href="/#contacto">Contacto</a></nav>
        <a className="reserva-login" href="/login">Iniciar sesión</a>
      </header>

      <section className="reserva-hero" aria-labelledby="reserva-title">
        <img src="/assets/img/placeholders/hero-4.jpg" alt="Pollitos de engorde para reserva" />
        <div><h1 id="reserva-title">Reserva de pollitos</h1><p>Selecciona la cantidad de cajas, el género y la semana para<br className="desktop-only" /> asegurar tus pollitos de engorde.</p></div>
      </section>

      <section className="reserva-card">
        <div className="reserva-features">
          <article><Icon src={icons.box} alt="" /><h2>Caja estándar</h2><p>100 pollitos aprox.</p></article>
          <article><Icon src={icons.calendar} alt="" /><h2>Reserva semanal</h2><p>Se habilita cada<br />inicio de semana.</p></article>
          <article><Icon src={icons.people} alt="" /><h2>Capacidad semanal</h2><p>80 - 100 personas.</p></article>
          <article><Icon src={icons.chick} alt="" /><h2>Pollitos de engorde</h2><p>Sin razas. Solo machos<br />o hembras (según<br />disponibilidad).</p></article>
        </div>

        <div className="reserva-layout">
          <section className="reserva-form" aria-label="Formulario de reserva">
            <div className="reserva-availability-heading"><h2>Disponibilidad de cajas</h2><label>Semana <select value={weekValue} onChange={(event) => changeWeek(event.target.value)}>{weeks.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div>
            <div className="reserva-stats"><div><span>Total de cajas</span><strong>{week.total}</strong></div><div><span>Reservadas</span><strong>{week.reserved}</strong></div><div><span>Disponibles</span><strong>{available}</strong></div></div>

            <fieldset className="reserva-fieldset"><legend>Selecciona la cantidad de cajas</legend><div className="reserva-counter"><button type="button" aria-label="Disminuir cantidad" onClick={() => setQuantity(Math.max(1, clampedQuantity - 1))}>−</button><output aria-live="polite">{clampedQuantity}</output><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity(Math.min(maxQuantity, clampedQuantity + 1))}>+</button></div><p>Cada caja contiene aprox. 100 pollitos.</p></fieldset>

            <fieldset className="reserva-fieldset"><legend>Selecciona el género</legend><div className="reserva-genders"><label className={gender === 'Machos' ? 'selected' : ''}><input type="radio" name="genero" value="Machos" checked={gender === 'Machos'} onChange={() => setGender('Machos')} /><Icon src={icons.male} alt="" /><span><strong>Machos</strong><small>Disponible: {week.males} cajas</small></span></label><label className={gender === 'Hembras' ? 'selected' : ''}><input type="radio" name="genero" value="Hembras" checked={gender === 'Hembras'} onChange={() => setGender('Hembras')} /><Icon src={icons.female} alt="" /><span><strong>Hembras</strong><small>Disponible: {week.females} cajas</small></span></label></div></fieldset>

            <fieldset className="reserva-fieldset"><legend>Dirección de Entrega</legend><div className="reserva-delivery"><div className="reserva-inputs"><label><span className="sr-only">Dirección</span><input required placeholder="Dirección... (Calle, Carrera, Barrio)" /></label><label><span className="sr-only">Detalles</span><input placeholder="Detalles... (Edificio, Apto, Piso)" /></label><label><span className="sr-only">Tipo de entrega</span><input placeholder="Entrega... (En persona, Portería)" /></label></div><button type="button" className="reserva-map"><Icon src={icons.location} alt="" /><strong>Ubicar dirección<br />en el mapa</strong></button></div></fieldset>

            <label className="reserva-comments">Comentarios adicionales <span>(opcional)</span><textarea maxLength={200} value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Escribe algún comentario especial sobre tu reserva..." /><small>{comments.length}/200</small></label>
            <button className="reserva-submit" type="button" disabled={!canSubmit}><span>Confirmar reserva</span><Icon src={icons.calendar} alt="" /></button>
          </section>

          <aside className="reserva-summary"><h2><Icon src={icons.calendar} alt="" />Disponibilidad de cajas</h2><dl><div><dt>Semana</dt><dd>{weekText}</dd></div><div><dt>Cantidad de cajas:</dt><dd>{clampedQuantity}</dd></div><div><dt>Género:</dt><dd>{gender}</dd></div><div><dt>Total de pollitos (aprox.):</dt><dd>{totalChicks}</dd></div></dl><p className="reserva-notice"><Icon src={icons.door} alt="" />Tu reserva será confirmada vía correo electrónico y/o WhatsApp en un plazo de 24 horas.</p></aside>
        </div>

        <section className="reserva-help"><Icon src={icons.chick} alt="" /><div><h2>¿Tienes dudas?</h2><p>Si necesitas más información sobre nuestras reservas, contáctanos. Estamos para ayudarte.</p></div><div className="reserva-socials"><a href="https://facebook.com" aria-label="Facebook"><Icon src={icons.facebook} /></a><a href="https://wa.me/573205135667" aria-label="WhatsApp"><Icon src={icons.whatsapp} /></a><a href="https://instagram.com" aria-label="Instagram"><Icon src={icons.instagram} /></a></div></section>
      </section>

      <footer className="reserva-footer"><a className="reserva-brand" href="/" aria-label="Avinova inicio"><img src="/assets/img/logo/logo-avinova.png" alt="Avinova" /></a><nav aria-label="Enlaces del pie de página"><a href="/">Inicio</a><a href="/#nosotros">Conócenos</a><a href="/#servicios">Servicios</a><a href="/#contacto">Consultorías</a><a href="/#contacto">Investigación</a></nav><div className="reserva-footer-socials"><Icon src={icons.facebook} /><Icon src={icons.whatsapp} /><Icon src={icons.instagram} /></div></footer>
    </main>
  )
}
