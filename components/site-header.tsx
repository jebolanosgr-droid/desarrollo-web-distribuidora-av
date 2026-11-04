'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/registro'
  const { data: session } = useSession()

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
      {!isAuthPage && <div className="header-actions">{session?.user && <><a className="orders-header-link" href="/mis-pedidos" aria-label="Ver mis pedidos" title="Mis pedidos"><img src="/assets/img/icons/Shopping.png" alt="" aria-hidden="true" /></a><details className="user-menu"><summary aria-label="Abrir menú de usuario"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/user-XtRSaIqgjgnF1B0DPxTd5xaH5KQSu2.png" alt="" aria-hidden="true" /></summary><div><strong>{session.user.name}</strong><a href="/mis-pedidos">Mis pedidos</a><button type="button" onClick={async () => { await signOut(); window.location.href = '/' }}>Cerrar sesión</button></div></details></>} {!session?.user && <a className="button button-small" href="/login">Iniciar sesión</a>}</div>}
    </header>
  )
}
