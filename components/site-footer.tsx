export function SiteFooter() {
  return (
    <footer>
      <div className="footer-brand">
        <a className="brand" href="/" aria-label="Avinova inicio">
          <img src="/assets/img/logo/logo-avinova.png" alt="Avinova" />
        </a>
      </div>
      <nav className="footer-nav" aria-label="Navegación del pie de página">
        <a href="/">Inicio</a>
        <a href="/#nosotros">Conócenos</a>
        <a href="/#servicios">Servicios</a>
        <a href="/reserva">Reserva</a>
        <a href="/#contacto">Contacto</a>
      </nav>
      <div className="footer-contact">
        <span>(57) 320 513 5667</span>
        <span>avinova@correo.com</span>
        <span>Ibagué, Tolima, Colombia</span>
      </div>
      <div className="socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visitar Facebook de Avinova"><img src="/assets/img/social/facebook.png" alt="" /></a>
        <a href="https://wa.me/573205135667" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp a Avinova"><img src="/assets/img/social/whatsapp.png" alt="" /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram de Avinova"><img src="/assets/img/social/instagram.png" alt="" /></a>
      </div>
      <div className="footer-bottom">© 2026 Avinova. Todos los derechos reservados.</div>
    </footer>
  )
}
