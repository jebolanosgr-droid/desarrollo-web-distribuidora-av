'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type PasswordRecoveryFormProps = { mode: 'request' | 'reset'; token?: string }

export function PasswordRecoveryForm({ mode, token }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [completed, setCompleted] = useState(false)
  const isRequest = mode === 'request'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!isRequest && !token) {
      setError('Este enlace no es válido o ya venció. Solicita uno nuevo para continuar.')
      return
    }
    if (!isRequest && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setPending(true)
    try {
      if (isRequest) {
        await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/restablecer-contrasena`,
        })
        setMessage('Si existe una cuenta asociada a ese correo, recibirás un enlace para cambiar tu contraseña.')
      } else {
        const result = await authClient.resetPassword({ newPassword: password, token: token! })
        if (result.error) throw new Error('reset_failed')
        setCompleted(true)
        setMessage('Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.')
      }
    } catch {
      setError(isRequest
        ? 'No pudimos procesar la solicitud. Inténtalo de nuevo más tarde.'
        : 'El enlace no es válido o ya venció. Solicita uno nuevo para continuar.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link href="/" className="login-logo" aria-label="Avinova, inicio"><img src="/assets/img/logo/logo-avinova.png" alt="Avinova" /></Link>
        <nav className="login-nav" aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/#conocenos">Conócenos</Link><Link href="/#reserva">Reserva</Link><Link href="/#contacto">Contacto</Link></nav>
        <div className="login-actions"><Link className="login-session-link" href="/login">Iniciar sesión</Link></div>
      </header>
      <main className="login-main recovery-main">
        <section className="recovery-card" aria-labelledby="recovery-title">
          <div className="recovery-intro">
            <span className="recovery-eyebrow">AVINOVA · ACCESO SEGURO</span>
            <h1 id="recovery-title">{completed ? 'Contraseña actualizada' : isRequest ? 'Recupera tu contraseña' : !token ? 'Enlace no válido' : 'Crea una nueva contraseña'}</h1>
            <p>{completed ? 'Tu cuenta está lista para que vuelvas a iniciar sesión.' : isRequest ? 'Escribe el correo asociado a tu cuenta y te enviaremos las instrucciones para recuperar el acceso.' : !token ? 'Solicita un enlace nuevo para recuperar el acceso a tu cuenta.' : 'Elige una contraseña nueva para volver a acceder a tus reservas.'}</p>
          </div>

          {completed ? (
            <div className="recovery-success-panel" role="status"><CheckCircle2 aria-hidden="true" /><p>{message}</p><Link className="login-primary recovery-submit" href="/login">Ir a iniciar sesión <ArrowRight aria-hidden="true" /></Link></div>
          ) : !isRequest && !token ? (
            <div className="recovery-form recovery-error-panel" role="alert"><p>Este enlace no es válido o ya venció. Solicita uno nuevo para continuar.</p><Link href="/recuperar-contrasena">Solicitar otro enlace</Link></div>
          ) : (
            <form className="recovery-form" onSubmit={submit}>
              {isRequest ? <label className="recovery-field"><Mail aria-hidden="true" /><span className="sr-only">Correo electrónico</span><input type="email" name="email" autoComplete="email" placeholder="Correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} required /></label> : <>
                <label className="recovery-field"><LockKeyhole aria-hidden="true" /><span className="sr-only">Nueva contraseña</span><input type="password" name="new-password" autoComplete="new-password" placeholder="Nueva contraseña (mínimo 8 caracteres)" minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                <label className="recovery-field"><LockKeyhole aria-hidden="true" /><span className="sr-only">Confirmar contraseña</span><input type="password" name="confirm-password" autoComplete="new-password" placeholder="Confirmar nueva contraseña" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
              </>}
              {error && <p className="recovery-error" role="alert">{error}</p>}
              {message && <p className="recovery-success" role="status">{message}</p>}
              <button className="login-primary recovery-submit" type="submit" disabled={pending}>{pending ? 'Procesando…' : isRequest ? 'Enviar instrucciones' : 'Guardar nueva contraseña'} <ArrowRight aria-hidden="true" /></button>
              <Link className="recovery-back" href="/login"><ArrowLeft aria-hidden="true" /> Volver a iniciar sesión</Link>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
