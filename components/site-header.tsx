'use client'

import { useState } from 'react'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Avinova inicio">
        <img src="/assets/img/logo/logo-avinova.png" alt="Avinova" />
      </a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? '×' : '☰'}
      </button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegación principal">
        <a href="/">Inicio</a>
        <a href="/#nosotros">Conócenos</a>
        <a href="/#servicios">Servicios</a>
        <a href="/reserva">Reserva</a>
        <a href="/#contacto">Contacto</a>
      </nav>
      <a className="button button-small" href="/login">Iniciar sesión</a>
    </header>
  )
}
