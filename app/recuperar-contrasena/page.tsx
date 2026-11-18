import '../login/login.css'
import { PasswordRecoveryForm } from '@/components/password-recovery-form'

export const metadata = {
  title: 'Recuperar contraseña | Avinova',
  description: 'Solicita un enlace seguro para recuperar el acceso a tu cuenta de Avinova.',
}

export default function RecoverPasswordPage() {
  return <PasswordRecoveryForm mode="request" />
}
