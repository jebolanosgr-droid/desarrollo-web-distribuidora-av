'use client'

import { useEffect, useState } from 'react'

const heroSlides = [
  { image: '/assets/img/placeholders/hero-1.jpg', alt: 'Pollitos bebés listos para distribución' },
  { image: '/assets/img/placeholders/hero-2.jpg', alt: 'Proceso de distribución de pollitos Avinova' },
  { image: '/assets/img/placeholders/hero-3.jpg', alt: 'Atención y entrega de pedidos Avinova' },
  { image: '/assets/img/placeholders/hero-4.jpg', alt: 'Pollitos de engorde de alta calidad' },
]

const benefits = [
  ['pollito.png', 'Pollitos de alta calidad', 'Sanos y de excelente genética.'],
  ['truck.png', 'Distribución segura', 'Llegan en óptimas condiciones a tu negocio.'],
  ['shield.png', 'Servicio confiable', 'Comprometidos con tu productividad.'],
  ['people.png', 'Atención personalizada', 'Te acompañamos en todo el proceso de compra.'],
]
const services = [
  ['pollito-yellow.png', 'Reserva de pollitos', 'Solicita tus pollitos de forma rápida y segura, según tus necesidades.', 'servicio-reserva.jpg'],
  ['box.png', 'Distribución segura', 'Coordinamos cada entrega para que recibas tu pedido a tiempo.', 'servicio-distribucion.jpg'],
  ['search.png', 'Asesoría personalizada', 'Encuentra la mejor alternativa para crecer con confianza.', 'servicio-asesoria.jpg'],
]

export default function Page() {
  const [slide, setSlide] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const next = () => setSlide((value) => (value + 1) % heroSlides.length)
  const previous = () => setSlide((value) => (value - 1 + heroSlides.length) % heroSlides.length)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return <main className="avinova-site">
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Avinova inicio"><img src="/assets/img/logo/logo-avinova.png" alt="Logo de Distribuidora Avinova" /></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegación principal"><a href="#inicio">Inicio</a><a href="#nosotros">Conócenos</a><a href="#servicios">Servicios</a><a href="#reserva">Reserva</a><a href="#contacto">Contacto</a></nav>
      <a className="button button-small" href="#reserva">Iniciar sesión</a>
    </header>

    <section className="hero shell" id="inicio">
      <div className="hero-copy"><p className="eyebrow">Distribuidora Avinova</p><h1>Pollitos bebés,<br />directo a tu negocio</h1><p>Conectamos granjas y clientes con pollitos de la mejor calidad, garantizando un proceso seguro, rápido y confiable.</p><div className="button-row"><a className="button" href="#servicios">Ver servicios →</a><a className="button button-outline" href="#reserva">Hacer una reserva</a></div></div>
      <div className="hero-visual" tabIndex={0} aria-label="Carrusel de imágenes de Avinova"><img src={heroSlides[slide].image} alt={heroSlides[slide].alt} /><div className="slider-controls"><button onClick={previous} aria-label="Imagen anterior">←</button>{heroSlides.map((item, index) => <button key={item.image} className={index === slide ? 'dot active' : 'dot'} onClick={() => setSlide(index)} aria-label={`Ver imagen ${index + 1}`} aria-current={index === slide ? 'true' : undefined}> </button>)}<button onClick={next} aria-label="Imagen siguiente">→</button></div></div>
      <div className="benefits">{benefits.map(([icon, title, text]) => <article key={title}><img src={`/assets/img/icons/${icon}`} alt="" aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="services section" id="servicios"><div className="section-intro"><p className="eyebrow">Lo que hacemos</p><h2>Soluciones para tu<br />granja y negocio</h2><p>Ofrecemos un servicio integral de distribución de pollitos bebés, con asesoría y acompañamiento en cada etapa.</p><a className="button" href="#contacto">Conocer más →</a></div><div className="service-grid">{services.map(([icon, title, text, image]) => <article className="service-card" key={title}><img className="card-image" src={`/assets/img/placeholders/${image}`} alt={`Imagen de ${title}`} /><img className="card-icon" src={`/assets/img/icons/${icon}`} alt="" aria-hidden="true" /><h3>{title}</h3><p>{text}</p><a href="#reserva">Conocer más →</a></article>)}</div></section>

    <section className="trust shell-dark" id="nosotros"><img className="trust-art" src="/assets/img/placeholders/alianza-avinova.jpg" alt="Equipo y alianza de distribución Avinova" /><div><p className="eyebrow">Tu aliado en cada etapa</p><h2>Tu aliado en cada etapa</h2><p>Brindamos confianza, calidad y respaldo en la distribución de pollitos bebés, con un equipo experto y un servicio cercano.</p><div className="trust-points"><span>Calidad garantizada</span><span>Entrega oportuna</span><span>Asesoría especializada</span><span>Clientes satisfechos</span></div></div></section>

    <section className="process shell"><p className="eyebrow">Simple y seguro</p><h2>Así es como trabajamos</h2><p>Un proceso simple y seguro para que recibas tus pollitos en el mejor estado.</p><div className="steps">{['Solicita tu reserva','Confirmamos','Preparamos el pedido','Recibes tus pollitos'].map((step, i) => <article key={step}><span>{i + 1}</span><div><h3>{step}</h3><p>{['Completa el formulario o contáctanos directamente.','Verificamos disponibilidad y te damos la confirmación.','Empacamos y organizamos la entrega.','En el lugar y fecha acordada.'][i]}</p></div></article>)}</div></section>

    <section className="contact section" id="contacto"><div><p className="eyebrow">Estamos para ayudarte</p><h2>¿Necesitas pollitos bebés?</h2><p>Completa el formulario con los datos de tu solicitud y nos pondremos en contacto contigo lo antes posible.</p><div className="contact-line">☎ <span>(57) 320 513 5667</span></div><div className="contact-line">✉ <span>avinova@correo.com</span></div></div><div className="map-card"><iframe title="Ubicación de referencia en Ibagué, Tolima" src="https://www.google.com/maps?q=Ibagué,Tolima,Colombia&output=embed" loading="lazy" /><a className="map-link" href="https://www.google.com/maps/search/?api=1&query=4.4389,-75.2322" target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a><small>Ubicación de referencia en Ibagué, Tolima.</small></div></section>

    <section className="reservation shell-dark" id="reserva"><div><p className="eyebrow">Reserva con nosotros</p><h2>Tu próximo pedido comienza aquí</h2><p>Consulta disponibilidad y recibe atención personalizada para tu granja.</p></div><a className="button" href="mailto:avinova@correo.com">Solicitar reserva →</a></section>
    <footer><div className="footer-brand"><a className="brand" href="#inicio"><img src="/assets/img/logo/logo-avinova.png" alt="Logo de Distribuidora Avinova" /></a><p>Distribución confiable de pollitos bebés para granjas y negocios.</p></div><nav className="footer-nav" aria-label="Navegación del pie de página"><a href="#inicio">Inicio</a><a href="#nosotros">Conócenos</a><a href="#servicios">Servicios</a><a href="#reserva">Reserva</a><a href="#contacto">Contacto</a></nav><div className="footer-contact"><span>(57) 320 513 5667</span><span>avinova@correo.com</span><span>Ibagué, Tolima, Colombia</span></div><div className="socials"><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visitar Facebook de Avinova"><img src="/assets/img/social/facebook.png" alt="" /></a><a href="https://wa.me/573205135667" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Avinova"><img src="/assets/img/social/whatsapp.png" alt="" /></a><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram de Avinova"><img src="/assets/img/social/instagram.png" alt="" /></a></div><div className="footer-bottom">© 2026 Distribuidora Avinova. Todos los derechos reservados.</div></footer>
  </main>
}
