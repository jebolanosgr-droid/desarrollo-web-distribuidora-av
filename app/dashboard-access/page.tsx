'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        setError(result?.error ?? 'No se pudo validar el acceso administrativo.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servicio de acceso. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dashboard-access-page">
      <section className="dashboard-access-card" aria-labelledby="dashboard-access-title">
        <div className="dashboard-access-art">
          <img src="/assets/img/placeholders/pollitos-montana.png" alt="Pollitos bebés de Avinova" />
          <span className="dashboard-access-kicker">Área privada</span>
          <h1>Administrador de reservas</h1>
          <p>Gestiona la disponibilidad y consulta las reservas realizadas por tus clientes.</p>
        </div>
        <form className="dashboard-access-form" onSubmit={handleSubmit}>
          <p className="dashboard-access-eyebrow">Acceso administrativo</p>
          <h2 id="dashboard-access-title">Iniciar sesión</h2>
          <p>Introduce la contraseña de acceso administrativo.</p>
          <label htmlFor="dashboard-password">Contraseña</label>
          <input id="dashboard-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required minLength={16} maxLength={512} />
          {error && <p className="dashboard-access-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Comprobando…' : 'Entrar al dashboard →'}</button>
        </form>
      </section>
    </main>
  )
}
