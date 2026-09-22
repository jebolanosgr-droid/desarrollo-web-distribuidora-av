'use client'

import { FormEvent, useState, type ReactNode } from 'react'
import './login.css'

const icons = {
  mail: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mail-WmjFifptFdtAPmkzW05FQEAMdYSCcs.png',
  lock: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/canda-oSPXW4C7zrzt76yFVe0b6GbSFYPb6B.png',
  eye: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eye-3ZrDN4XpKXzzFSLtHu2OhPrgSHjVEt.png',
  shield: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shi-n8QpC7kwQLr3mjKRVjx4NpYLwMi7er.png',
  delivery: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ban-sgqRh9agEss37kKb2HZh5XzQy4jqcQ.png',
  support: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/au-cO5yqWabLN44FStGbug9MxFbIHjYrQ.png',
}

function LoginField({ id, label, icon, type = 'text', value, onChange }: { id: string; label: string; icon: string; type?: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  return (
    <label className="login-field" htmlFor={id}>
      <img src={icon} alt="" aria-hidden="true" />
      <input id={id} name={id} type={isPassword && visible ? 'text' : type} placeholder={label} value={value} onChange={(event) => onChange(event.target.value)} required />
      {isPassword && <button className="login-password-toggle" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}><img src={icons.eye} alt="" aria-hidden="true" /></button>}
    </label>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true) }

  return <div className="login-page">
    <main className="login-main">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-intro">
          {/* Reemplazar este recurso por la fotografía final de la interfaz de login. */}
          <img className="login-placeholder" src="/assets/img/placeholders/login-placeholder.png" alt="Pollitos bebés en una granja avícola" />
          <h1>Tu negocio,<br />nuestro compromiso</h1>
          <p>Accede a tu cuenta para gestionar<br className="login-desktop-break" /> tus reservas de pollitos de engorde<br className="login-desktop-break" /> de forma rápida y segura.</p>
          <div className="login-benefits"><Benefit icon={icons.shield} text={<>Reservas<br />seguras</>} /><Benefit icon={icons.delivery} text={<>Información en<br />tiempo real</>} /><Benefit icon={icons.support} text={<>Soporte<br />dedicado</>} /></div>
        </div>
        <form className="login-form" onSubmit={submit} noValidate>
          <h2 id="login-title">Iniciar sesión</h2><p>Ingresa tus datos para continuar.</p>
          <LoginField id="email" label="Correo electrónico" icon={icons.mail} type="email" value={email} onChange={setEmail} />
          <LoginField id="password" label="Contraseña" icon={icons.lock} type="password" value={password} onChange={setPassword} />
          <div className="login-options"><label><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> <span>Recordar mi cuenta</span></label><a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a></div>
          {submitted && <p className="login-notice" role="status">Completa los datos para continuar.</p>}
          <button className="login-primary" type="submit">Iniciar sesión <span aria-hidden="true">→</span></button>
          <div className="login-register"><span>¿No tienes una cuenta?</span><a href="/registro">Registrate <span aria-hidden="true">→</span></a></div>
        </form>
      </section>
    </main>

  </div>
}

function Benefit({ icon, text }: { icon: string; text: ReactNode }) { return <div className="login-benefit"><img src={icon} alt="" aria-hidden="true" /><span>{text}</span></div> }
