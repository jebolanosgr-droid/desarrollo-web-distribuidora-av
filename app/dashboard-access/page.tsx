'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const response = await fetch('/api/dashboard-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, confirmation }),
    })
    if (!response.ok) {
      setError('La contraseña del administrador no es válida.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
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
          <p>Introduce la contraseña dos veces para entrar al panel.</p>
          <label htmlFor="dashboard-password">Contraseña</label>
          <input id="dashboard-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" />
          <label htmlFor="dashboard-confirmation">Confirmar contraseña</label>
          <input id="dashboard-confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" />
          {error && <p className="dashboard-access-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Comprobando...' : 'Entrar al dashboard →'}</button>
        </form>
      </section>
    </main>
  )
}
