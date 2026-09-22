'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/registro'

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
        <a href="/conocenos">Conócenos</a>
        {!isAuthPage && <a href="/reserva">Reserva</a>}
        <a href="/#contacto">Contacto</a>
      </nav>
      {!isAuthPage && <a className="button button-small" href="/login">Iniciar sesión</a>}
    </header>
  )
}
