'use client'

import { ArrowRight, Check, ChevronLeft, ChevronRight, Headphones, House, Mail, MapPin, Menu, Package, Phone, Search, ShieldCheck, Sparkles, Truck, Users, X } from 'lucide-react'
import { useState } from 'react'

const benefits = [
  { icon: Sparkles, title: 'Pollitos de alta calidad', text: 'Sanos y de excelente genética.' },
  { icon: Truck, title: 'Distribución segura', text: 'Llegan en óptimas condiciones a tu negocio.' },
  { icon: ShieldCheck, title: 'Servicio confiable', text: 'Comprometidos con tu productividad.' },
  { icon: Users, title: 'Atención personalizada', text: 'Te acompañamos en todo el proceso de compra.' },
]

const services = [
  { icon: Sparkles, title: 'Reserva de pollos', text: 'Solicita tus pollitos de forma rápida y segura, según tus necesidades.' },
  { icon: Package, title: 'Distribución confiable', text: 'Coordinamos cada entrega para que recibas tu pedido a tiempo.' },
  { icon: Search, title: 'Asesoría para tu granja', text: 'Encuentra la mejor alternativa para crecer con confianza.' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main className="avinova-site">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Avinova inicio"><span className="brand-mark">◕</span><span>AVINOVA<small>Distribuidora avícola</small></span></a>
        <button className="menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <a href="#inicio">Inicio</a><a href="#nosotros">Conócenos</a><a href="#reserva">Reserva</a><a href="#contacto">Contacto</a>
        </nav>
        <div className="header-actions"><Search size={21} /><a className="button button-small" href="#reserva">Iniciar Sesión</a></div>
      </header>

      <section className="hero shell" id="inicio">
        <div className="hero-copy"><p className="eyebrow">Distribuidora Avinova</p><h1>Pollitos bebés,<br />directo a tu negocio</h1><p>Conectamos granjas y clientes con pollitos de la mejor calidad, garantizando un proceso seguro, rápido y confiable.</p><div className="button-row"><a className="button" href="#servicios">Ver servicios <ArrowRight size={16} /></a><a className="button button-outline" href="#reserva">Hacer una reserva</a></div></div>
        <div className="hero-visual"><div className="chick-art"><Sparkles size={58} /><strong>Pollitos<br />Avinova</strong></div><div className="slider-controls"><button aria-label="Anterior"><ChevronLeft /></button><span>● ● <b>●</b> ●</span><button aria-label="Siguiente"><ChevronRight /></button></div></div>
        <div className="benefits">{benefits.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={39} strokeWidth={1.8} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>

      <section className="services section" id="servicios"><div className="section-intro"><p className="eyebrow">Lo que hacemos</p><h2>Soluciones para tu<br />granja y negocio</h2><p>Ofrecemos un servicio integral de distribución de pollitos bebés, con asesoría y acompañamiento en cada etapa.</p><a className="button" href="#contacto">Conocer más <ArrowRight size={16} /></a></div><div className="service-grid">{services.map(({ icon: Icon, title, text }) => <article className="service-card" key={title}><div className="card-image"><Icon size={46} /></div><Icon className="card-icon" size={29} /><h3>{title}</h3><p>{text}</p><a href="#reserva">Conocer más <ArrowRight size={14} /></a></article>)}</div></section>

      <section className="trust shell-dark" id="nosotros"><div className="trust-art"><ShieldCheck size={74} /></div><div><p className="eyebrow">Tu aliado en cada etapa</p><h2>Tu aliado en cada etapa</h2><p>Brindamos confianza, calidad y respaldo en la distribución de pollitos bebés, con un equipo experto y un servicio cercano.</p><div className="trust-points"><span><ShieldCheck /> Calidad garantizada</span><span><Truck /> Entrega oportuna</span><span><Headphones /> Asesoría especializada</span><span><Sparkles /> Clientes satisfechos</span></div></div></section>

      <section className="process shell"><p className="eyebrow">Simple y seguro</p><h2>Así es como trabajamos</h2><p>Un proceso simple y seguro para que recibas tus pollitos en el mejor estado.</p><div className="steps">{['Solicita tu reserva','Confirmamos','Preparamos el pedido','Recibes tus pollitos'].map((step, i) => <article key={step}><span>{i + 1}</span><div><h3>{step}</h3><p>{['Completa el formulario o contáctanos directamente.','Verificamos disponibilidad y te damos la confirmación.','Empacamos y organizamos la entrega.','En el lugar y fecha acordada.'][i]}</p></div></article>)}</div></section>

      <section className="contact section" id="contacto"><div><p className="eyebrow">Estamos para ayudarte</p><h2>¿Necesitas pollitos bebés?</h2><p>Completa el formulario con los datos de tu solicitud y nos pondremos en contacto contigo lo antes posible.</p><div className="contact-line"><Phone size={19} /> (57) 320 513 5667</div><div className="contact-line"><Mail size={19} /> avinova@correo.com</div></div><div className="map-placeholder"><MapPin size={56} /></div></section>

      <section className="reservation shell-dark" id="reserva"><div><p className="eyebrow">Reserva con nosotros</p><h2>Tu próximo pedido comienza aquí</h2><p>Consulta disponibilidad y recibe atención personalizada para tu granja.</p></div><a className="button" href="mailto:avinova@correo.com">Solicitar reserva <ArrowRight size={16} /></a></section>
      <footer><div className="brand"><span className="brand-mark">◕</span><span>AVINOVA<small>Distribuidora avícola</small></span></div><span>© 2026 Avinova. Calidad que llega a tu granja.</span><div className="socials">f&nbsp;&nbsp; ◉ &nbsp;◎</div></footer>
    </main>
  )
}
