import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">AVINOVA GROUP</p><h1>Bienvenido de nuevo</h1><p>Ingresa para gestionar tus reservas de pollitos.</p><AuthForm mode="login" /><Link href="/registro">¿No tienes una cuenta? Regístrate</Link></section></main>
}
