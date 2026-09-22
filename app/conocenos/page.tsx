import type { Metadata } from 'next'
import './conocenos.css'

export const metadata: Metadata = {
  title: 'Conócenos | Avinova Group',
  description: 'Conoce la historia, misión, valores y cobertura regional de Avinova Group.',
}

const values = [
  ['shield', 'Calidad garantizada', 'Seleccionamos y distribuimos productos bajo altos estándares de calidad para ofrecer resultados confiables.'],
  ['people', 'Confianza', 'Construimos relaciones transparentes y duraderas, cumpliendo nuestros compromisos en cada etapa.'],
  ['headset', 'Atención personalizada', 'Escuchamos las necesidades de cada cliente para ofrecer acompañamiento cercano y soluciones oportunas.'],
  ['truck', 'Distribución responsable', 'Trabajamos con procesos organizados para que cada entrega llegue de forma segura y eficiente.'],
]

const benefits = [
  ['star', 'Calidad superior'],
  ['truck', 'Entregas seguras'],
  ['people', 'Atención personalizada'],
  ['home', 'Cobertura regional'],
]

export default function ConocenosPage() {
  return (
    <main className="conocenos-page">
      <section className="conocenos-hero" aria-labelledby="conocenos-title">
        <div className="conocenos-hero-copy">
          <h1 id="conocenos-title">Nuestro misión es<br />llegar a ser la distribuidora<br />#1 del país</h1>
          <a className="conocenos-button" href="#historia">CONÓCENOS</a>
        </div>
      </section>

      <section className="conocenos-card conocenos-intro">
        <div>
          <span className="conocenos-kicker">CONÓCENOS</span>
          <h2>Conoce Avinova Group</h2>
          <p>Conectamos granjas y clientes con pollitos de la mejor calidad,<br />garantizando un proceso seguro, rápido y confiable.<br />Desde Ibagué llevamos genética de excelencia a productores<br />y distribuidores en todo el departamento del Caquetá,<br />garantizando calidad, confianza y acompañamiento en cada<br />entrega.</p>
          <div className="conocenos-intro-actions">
            <a className="conocenos-button" href="#contacto">Contactanos <span aria-hidden="true">→</span></a>
            <a className="conocenos-button conocenos-button-outline" href="#cobertura">Ver cobertura <img src="/assets/img/ubicacion.png" alt="" aria-hidden="true" /></a>
          </div>
        </div>
        <img src="/assets/img/conocenos-intro.png" alt="Pollitos de Avinova Group" loading="lazy" />
      </section>

      <section id="historia" className="conocenos-card conocenos-history">
        <img src="/assets/img/conocenos-historia-ref.png" alt="Camión de Avinova Group durante una entrega" loading="lazy" />
        <div>
          <span className="conocenos-kicker">NUESTRA HISTORIA</span>
          <h2>Comprometidos con la calidad desde el primer día</h2>
          <p>En Avinova Group trabajamos para conectar a las tiendas avícolas con pollitos COBB de excelente genética y desempeño.</p>
          <p>Nuestro objetivo es ofrecer aves sanas y listas para contribuir al crecimiento de cada negocio, respaldadas por un proceso de distribución responsable y eficiente.</p>
        </div>
      </section>

      <section className="conocenos-mission" aria-label="Misión y visión">
        <article className="conocenos-card conocenos-mission-card"><div className="conocenos-icon"><img src="/assets/img/icons/shield.png" alt="" aria-hidden="true" /></div><span className="conocenos-kicker">NUESTRO PROPÓSITO</span><h2>Nuestra misión</h2><p>Conectar a nuestros clientes con pollitos de excelente genética y productos avícolas confiables, brindando una distribución segura, eficiente y acompañada de atención personalizada.</p></article>
        <article className="conocenos-card conocenos-mission-card"><div className="conocenos-icon"><img src="/assets/img/icons/star.png" alt="" aria-hidden="true" /></div><span className="conocenos-kicker">NUESTRA PROYECCIÓN</span><h2>Nuestra visión</h2><p>Ser la distribuidora avícola de referencia en la región, reconocida por la calidad de sus productos, la eficiencia de sus entregas y la confianza construida con cada cliente.</p></article>
      </section>

      <section className="conocenos-values" aria-label="Valores de Avinova Group">
        <div className="conocenos-values-grid">
          <article><div className="conocenos-icon"><img src="/assets/img/icons/shield.png" alt="" aria-hidden="true" /></div><div><h3>Calidad garantizada</h3><p>Distribuimos pollitos COBB seleccionados bajo altos estándares de calidad</p></div></article>
          <article><div className="conocenos-icon"><img src="/assets/img/icons/truck.png" alt="" aria-hidden="true" /></div><div><h3>Cobertura regional</h3><p>Realizamos la distribución hasta múltiples municipios del Caquetá y Huila</p></div></article>
          <article><div className="conocenos-icon"><img src="/assets/img/icons/people.png" alt="" aria-hidden="true" /></div><div><h3>Compromiso y confianza</h3><p>Construimos relaciones duraderas basadas en cumplimiento y atención personalizada</p></div></article>
        </div>
      </section>

      <section className="conocenos-card conocenos-coverage"><div><span className="conocenos-kicker">NUESTRA COBERTURA</span><h2>Llegamos a más lugares para impulsar el crecimiento avícola</h2><p>Realizamos distribución en diferentes municipios del Huila y Caquetá, acercando productos confiables a productores, tiendas avícolas y negocios de la región.</p><div className="conocenos-regions"><span><img src="/assets/img/icons/home.png" alt="" aria-hidden="true" />Huila</span><span><img src="/assets/img/icons/home.png" alt="" aria-hidden="true" />Caquetá</span></div></div><div className="conocenos-coverage-art"><img src="/assets/img/conocenos-hero.png" alt="Paisaje de la región de cobertura de Avinova" loading="lazy" /></div></section>

      <section className="conocenos-proposal"><div className="conocenos-proposal-image"><img src="/assets/img/conocenos-propuesta.png" alt="Equipo preparando una entrega avícola" loading="lazy" /></div><div><span className="conocenos-kicker">NUESTRA PROPUESTA</span><h2>Genética de excelencia y atención cercana</h2><p>Trabajamos para que cada cliente reciba productos confiables, con logística organizada y un acompañamiento que responda a sus necesidades.</p><div className="conocenos-benefits">{benefits.map(([icon, title]) => <div key={title}><img src={`/assets/img/icons/${icon}.png`} alt="" aria-hidden="true" /><strong>{title}</strong></div>)}</div></div></section>

      <section className="conocenos-contact"><span className="conocenos-kicker">ESTAMOS PARA ACOMPAÑARTE</span><h2>¿Quieres conocer más sobre nosotros?</h2><p>Estamos disponibles para resolver tus dudas y acompañarte en tus necesidades de distribución avícola.</p><div><a className="conocenos-button" href="/#contacto">Contáctanos</a><a className="conocenos-button conocenos-button-outline" href="/reserva">Haz una reserva</a></div></section>
    </main>
  )
}
