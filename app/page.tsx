'use client'

import { useEffect, useState } from 'react'

const heroSlides = [
  { image: '/assets/img/placeholders/hero-1.jpg', alt: 'Pollitos bebés listos para distribución' },
  { image: '/assets/img/placeholders/hero-2.jpg', alt: 'Proceso de distribución de pollitos' },
  { image: '/assets/img/placeholders/hero-3.jpg', alt: 'Atención y entrega de pedidos' },
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
const trustPoints = [
  ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Escudo%20blanco-Kikm5Ky4Xr8h3VXxCCMZVs0VEK8dIO.png', 'Calidad garantizada'],
  ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Carro%20blanco-WO2strpQIAvDvGvkzEwC308f4kAxvJ.png', 'Entrega Oportuna'],
  ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Auri%20blanco-AnlkAK3f8S8HArQuQm8O8uxGSWLGXI.png', 'Asesoria especializada'],
  ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Estrella%20blanca-9B59vJlM4m3brtBwArY4H5FRpMDOdm.png', 'Clientes satisfechos'],
]
const steps = [
  ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/form-1XJbVMIKNOfTOgJUWXSmOs9vlrQ00z.png', 'Solicita tu reserva', 'Completa el formulario o contáctanos directamente.'],
  ['check.png', 'Confirmamos', 'Verificamos disponibilidad y te damos la confirmación.'],
  ['truck.png', 'Preparamos el pedido', 'Empacamos y organizamos la entrega.'],
  ['home.png', 'Recibes tus pollitos', 'En el lugar y fecha acordada.'],
]

export default function Page() {
  const [slide, setSlide] = useState(0)
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
    <section className="hero shell" id="inicio">
      <div className="hero-copy"><h1>Pollitos bebés,<br />directo a tu negocio</h1><p>Conectamos granjas y clientes con pollitos de la mejor calidad, garantizando un proceso seguro, rápido y confiable.</p><div className="button-row"><a className="button" href="#servicios">Ver servicios <span aria-hidden="true">→</span></a><a className="button button-outline" href="#reserva">Hacer una reserva</a></div></div>
      <div className="hero-visual" tabIndex={0} aria-label="Carrusel de imágenes"><img src={heroSlides[slide].image} alt={heroSlides[slide].alt} /><div className="slider-controls"><button onClick={previous} aria-label="Imagen anterior">←</button>{heroSlides.map((item, index) => <button key={item.image} className={index === slide ? 'dot active' : 'dot'} onClick={() => setSlide(index)} aria-label={`Ver imagen ${index + 1}`} aria-current={index === slide ? 'true' : undefined}> </button>)}<button onClick={next} aria-label="Imagen siguiente">→</button></div></div>
      <div className="benefits">{benefits.map(([icon, title, text]) => <article key={title}><img src={`/assets/img/icons/${icon}`} alt="" aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="services section" id="servicios"><div className="section-intro"><h2>Soluciones para tu<br />granja y negocio</h2><p>Ofrecemos un servicio integral de distribución de pollitos bebés, con asesoría y acompañamiento en cada etapa.</p><a className="button" href="#contacto">Conocer más <span aria-hidden="true">→</span></a></div><div className="service-grid">{services.map(([icon, title, text, image]) => <article className="service-card" key={title}><img className="card-image" src={`/assets/img/placeholders/${image}`} alt={`Imagen de ${title}`} /><img className="card-icon" src={`/assets/img/icons/${icon}`} alt="" aria-hidden="true" /><h3>{title}</h3><p>{text}</p><a href="#reserva">Conocer más <span aria-hidden="true">→</span></a></article>)}</div></section>

    <section className="trust shell-dark" id="nosotros"><img className="trust-art" src="/assets/img/placeholders/alianza-avinova.jpg" alt="Equipo y alianza de distribución" /><div className="trust-content"><h2>Tu aliado en cada etapa</h2><p>Brindamos confianza, calidad y respaldo en la distribución de pollitos bebés, con un equipo experto y un servicio cercano.</p><div className="trust-points">{trustPoints.map(([icon, text]) => <div key={text}><img src={icon} alt="" aria-hidden="true" /><span>{text}</span></div>)}</div></div></section>

    <section className="process shell"><h2>Así es como trabajamos</h2><p>Un proceso claro para que recibas tus pollitos en el mejor estado.</p><div className="steps">{steps.map(([icon, title, text], i) => <article key={title}><div className="step-marker"><span>{i + 1}</span><img src={icon.startsWith('http') ? icon : `/assets/img/icons/${icon}`} alt="" aria-hidden="true" /></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

    <section className="contact section" id="contacto"><div><h2>¿Necesitas pollitos bebés?</h2><p>Completa el formulario con los datos de tu solicitud y nos pondremos en contacto contigo lo antes posible.</p><div className="contact-line"><a href="tel:+573205135667" aria-label="Llamar a Avinova al número 320 513 5667"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telefono-FeH0yfGiLlN9dLEj8vSiISqd576Aau.png" alt="" aria-hidden="true" /><span>(57) 320 513 5667</span></a></div><div className="contact-line"><a href="mailto:avinova@correo.com" aria-label="Enviar correo a Avinova"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/correo-GL97FdXMCD2UG8X1IxC2rxeY2t7tpN.png" alt="" aria-hidden="true" /><span>avinova@correo.com</span></a></div></div><div className="map-card"><iframe title="Mapa de referencia de Avinova" src="https://www.google.com/maps?q=Ibagué,Tolima,Colombia&output=embed" loading="lazy" /></div></section>


  </main>
}
