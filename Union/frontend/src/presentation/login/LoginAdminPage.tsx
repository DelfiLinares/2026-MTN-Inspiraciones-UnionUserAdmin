/**
 * `LoginAdminPage`: Pantalla de Login del módulo administrativo (HU-10).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T095) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/login/`. Por instrucción explícita
 * del usuario para esta tarea puntual, la implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/login/`, sin leer ni modificar
 * ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-10, RF-11, RF-12, RF-77, AC-04.9)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T095)
 *
 * Criterios de aceptación cubiertos:
 * - HU-10 / RF-11: Formulario de login de administrador (mail/contraseña).
 * - RF-12: El acceso al módulo administrativo se permite únicamente a cuentas con rol ADMIN;
 *   cualquier otro rol se rechaza con un mensaje claro (inverso a la validación de T084, donde se
 *   rechazaba el rol ADMIN en el frontend de usuario).
 * - RF-77 / AC-04.9 (aplicado también al login admin): muestra un mensaje específico si la cuenta
 *   está BANEADO o ELIMINADO, capturando `CuentaBloqueadaError`.
 * - Bloquea el envío del formulario mientras `enviando === true`.
 */

import React, { useState } from 'react'
import { authService, CuentaBloqueadaError, MENSAJE_CREDENCIALES_INVALIDAS } from '../../services/authService'

export const LoginAdminPage: React.FC = () => {
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const mailLimpio = mail.trim()
    if (!mailLimpio || !password) {
      setErrorMensaje('Por favor, ingresá tu mail y contraseña.')
      return
    }

    setEnviando(true)
    setErrorMensaje(null)

    try {
      const resultado = await authService.login({ mail: mailLimpio, password })

      // RF-12: El acceso al módulo administrativo se permite únicamente a rol ADMIN
      if ((resultado.usuario.rol as unknown as string) !== 'ADMIN') {
        authService.logout()
        setErrorMensaje('Acceso restringido: esta cuenta no posee permisos de administrador.')
        return
      }

      // Login administrativo exitoso: la integración con el guard de sesión administrativa
      // (equivalente a `sessionGuard`/`AuthAdminService` del proyecto `Admin/`) y la redirección
      // al dashboard quedan fuera del alcance de esta tarea puntual (T095), que cubre únicamente
      // la pantalla de login.
    } catch (err: unknown) {
      if (err instanceof CuentaBloqueadaError) {
        // RF-77 / AC-04.9: Mensaje específico para cuenta BANEADA o ELIMINADA
        setErrorMensaje(err.message)
      } else {
        setErrorMensaje(MENSAJE_CREDENCIALES_INVALIDAS)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Ingreso al módulo administrativo
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-2xl sm:px-10 border border-gray-100">
          {errorMensaje && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2"
            >
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMensaje}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} aria-label="Formulario de login de administrador">
            <div>
              <label htmlFor="input-admin-mail" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="input-admin-mail"
                type="email"
                autoComplete="email"
                required
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                disabled={enviando}
                placeholder="admin@plataforma.com"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="input-admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="input-admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={enviando}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={enviando || !mail.trim() || !password}
              className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
