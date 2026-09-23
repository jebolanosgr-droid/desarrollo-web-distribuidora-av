import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function RegistroPage() {
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">AVINOVA GROUP</p><h1>Crea tu cuenta</h1><p>Guarda tus datos y consulta tus reservas fácilmente.</p><AuthForm mode="register" /><Link href="/login">¿Ya tienes una cuenta? Inicia sesión</Link></section></main>
}
