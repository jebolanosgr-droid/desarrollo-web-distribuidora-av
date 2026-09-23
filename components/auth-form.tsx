'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setPending(true)
    const data = new FormData(event.currentTarget)
    const result = mode === 'login'
      ? await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
      : await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
    setPending(false)
    if (result.error) { setError('No pudimos completar la solicitud. Revisa tus datos e inténtalo nuevamente.'); return }
    router.push('/dashboard'); router.refresh()
  }
  return <form className="auth-form" onSubmit={submit}>
    {mode === 'register' && <label>Nombre<input name="name" required autoComplete="name" /></label>}
    <label>Correo electrónico<input name="email" type="email" required autoComplete="email" /></label>
    <label>Contraseña<input name="password" type="password" minLength={8} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button type="submit" disabled={pending}>{pending ? 'Procesando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</button>
  </form>
}
