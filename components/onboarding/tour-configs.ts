import type { OnboardingStep } from './onboarding-tour'

export const tourSteps: Record<string, OnboardingStep[]> = {
  inicio: [
    { target: 'home-hero', title: 'Bienvenido a Avinova', description: 'En Avinova conectamos granjas y clientes con pollitos de calidad, de forma segura y confiable.' },
    { target: 'home-services', title: 'Conoce nuestros servicios', description: 'Explora las soluciones de reserva, distribución y asesoría para tu negocio.' },
    { target: 'home-process', title: 'Así funciona', description: 'Conoce los pasos desde tu solicitud hasta la entrega de tus pollitos.' },
    { target: 'home-reservation', title: 'Haz tu reserva', description: 'Cuando estés listo, entra a Reserva para solicitar tus pollitos y elegir la semana disponible.' },
    { target: 'home-contact', title: '¿Necesitas ayuda?', description: 'Si tienes preguntas, encuentra nuestros datos de contacto y escríbenos.' },
  ],
  registro: [
    { target: 'register-intro', title: 'Crea tu cuenta en Avinova', description: 'Regístrate para realizar reservas de pollitos, consultar tus solicitudes y recibir información de tu pedido.' },
    { target: 'register-form', title: 'Completa tus datos', description: 'Ingresa tu nombre, correo y teléfono correctamente para identificar tu cuenta y comunicarnos contigo.' },
    { target: 'register-password', title: 'Protege tu cuenta', description: 'Crea una contraseña segura y confírmala. Usa el icono de ojo para mostrarla u ocultarla.' },
    { target: 'register-user-type', title: 'Selecciona tu tipo de usuario', description: 'Elige si realizas la reserva como cliente o si representas una empresa o negocio.' },
    { target: 'register-submit', title: 'Finaliza tu registro', description: 'Cuando los campos estén completos, presiona Registrarse para continuar.' },
    { target: 'register-login-link', title: '¿Ya tienes una cuenta?', description: 'Si ya te registraste, utiliza esta opción para iniciar sesión.' },
  ],
  login: [
    { target: 'login-form', title: 'Ingresa a tu cuenta', description: 'Inicia sesión para acceder a tus reservas y funciones disponibles.' },
    { target: 'login-password', title: 'Correo y contraseña', description: 'Escribe tus credenciales. Usa el icono de ojo si necesitas comprobar la contraseña.' },
    { target: 'login-remember', title: 'Mantén tu sesión', description: 'Activa Recordar mi cuenta solo en un dispositivo personal y seguro.' },
    { target: 'login-submit', title: 'Iniciar sesión', description: 'Presiona este botón para acceder a tu cuenta.' },
    { target: 'login-forgot-password', title: '¿Olvidaste tu contraseña?', description: 'Usa esta opción para seguir el proceso de recuperación de acceso.' },
  ],
  reserva: [
    { target: 'reservation-intro', title: 'Reserva tus pollitos', description: 'Solicita cajas de pollitos para una semana disponible y revisa todos los datos antes de confirmar.' },
    { target: 'reservation-availability', title: 'Consulta la disponibilidad', description: 'Aquí verás las cajas totales, reservadas y disponibles.' },
    { target: 'reservation-week', title: 'Selecciona una semana', description: 'Elige la semana habilitada en la que deseas recibir tu pedido.' },
    { target: 'reservation-gender', title: 'Elige el género', description: 'Selecciona Machos o Hembras según la disponibilidad.' },
    { target: 'reservation-quantity', title: 'Indica cuántas cajas necesitas', description: 'Usa los botones más y menos. Cada caja representa aproximadamente 100 pollitos.' },
    { target: 'reservation-delivery', title: 'Completa la entrega', description: 'Escribe la dirección, referencias y fecha de entrega.' },
    { target: 'reservation-map', title: 'Ubica el punto de entrega', description: 'Usa el mapa para precisar dónde recibirás el pedido.' },
    { target: 'reservation-summary', title: 'Revisa tu reserva', description: 'Verifica semana, género, cantidad y datos de entrega.' },
    { target: 'reservation-confirm', title: 'Confirma tu solicitud', description: 'Cuando todo sea correcto, presiona Confirmar reserva.' },
  ],
  dashboard: [
    { target: 'dashboard-intro', title: 'Administrador de reservas', description: 'Habilita semanas, establece cajas disponibles y revisa solicitudes.' },
    { target: 'dashboard-week', title: 'Selecciona la semana', description: 'Indica la semana que deseas habilitar o administrar.' },
    { target: 'dashboard-boxes', title: 'Define las cajas disponibles', description: 'Escribe el total de cajas que podrán reservarse.' },
    { target: 'dashboard-information', title: 'Verifica los datos antes de guardar', description: 'Consulta el resumen y estado de la disponibilidad.' },
    { target: 'dashboard-enable', title: 'Habilita la reserva semanal', description: 'Crea o actualiza la disponibilidad de la semana.' },
    { target: 'dashboard-close', title: 'Cierra una semana de reservas', description: 'Impide nuevas solicitudes sin eliminar las existentes.' },
    { target: 'dashboard-filters', title: 'Encuentra reservas rápidamente', description: 'Filtra o busca por nombre, correo, teléfono y estado.' },
    { target: 'dashboard-reservations', title: 'Consulta las reservas registradas', description: 'Cada tarjeta muestra los datos principales de una solicitud.' },
  ],
}
