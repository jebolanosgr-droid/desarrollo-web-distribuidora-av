import '../login/login.css'
import { PasswordRecoveryForm } from '@/components/password-recovery-form'

export const metadata = {
  title: 'Nueva contraseña | Avinova',
  description: 'Crea una nueva contraseña para volver a acceder a tu cuenta de Avinova.',
}

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  return <PasswordRecoveryForm mode="reset" token={token} />
}
