/**
 * Pantalla de Login de Usuario (`LoginPage.tsx`, HU-04).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-04, RF-01, RF-02, RF-03, RF-04, RF-77, RF-78, AC-04.9, Resuelto A14)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T084)
 *
 * Características:
 * - Tres opciones de login: Mail + Contraseña, OAuth Google, OAuth GitHub.
 * - Bloqueo de submit mientras `enviando === true`.
 * - Muestra mensaje de error específico si la cuenta está BANEADA / ELIMINADA (AC-04.9, RF-77).
 * - Muestra mensaje de credenciales inválidas (RF-03).
 * - Si la cuenta autenticada posee el rol ADMIN, rechaza el acceso a `frontend/` y redirige a la consola administrativa / módulo de admin con mensaje claro (RF-78, Resuelto A14).
 * - Redirección post-login a la página de origen o `/feed`.
 */

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import {
  authService,
  CuentaBloqueadaError,
  MENSAJE_CREDENCIALES_INVALIDAS,
} from '../../services/authService'
import './login.css'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { iniciarSesion } = useAuth()

  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Determinar la ruta de destino original tras el login (fallback a /feed)
  const estadoNavegacion = location.state as
    | { from?: { pathname: string }; mensaje?: string }
    | undefined
  const destinoPostLogin = estadoNavegacion?.from?.pathname ?? '/feed'

  // RF-78 / Resuelto A14: refuerzo de mensaje cuando `RutaProtegida` (T094) redirige aquí
  // tras rechazar una sesión ADMIN persistida que intentaba operar en `frontend/`.
  const [errorMensaje, setErrorMensaje] = useState<string | null>(estadoNavegacion?.mensaje ?? null)

  const handleSubmitMailPassword = async (e: React.FormEvent) => {
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

      // RF-78 / Resuelto A14: Verificar si el rol de la cuenta es ADMIN
      if ((resultado.usuario.rol as unknown as string) === 'ADMIN') {
        authService.logout()
        setErrorMensaje(
          'Acceso restringido: las cuentas administrativas deben iniciar sesión desde la consola de administración.'
        )
        return
      }

      // Login de usuario normal exitoso
      iniciarSesion(resultado.usuario)
      navigate(destinoPostLogin, { replace: true })
    } catch (err: unknown) {
      if (err instanceof CuentaBloqueadaError) {
        // AC-04.9, RF-77: Mensaje específico para cuenta BANEADA o ELIMINADA
        setErrorMensaje(err.message)
      } else {
        // RF-03: Mensaje genérico de credenciales inválidas
        setErrorMensaje(MENSAJE_CREDENCIALES_INVALIDAS)
      }
    } finally {
      setEnviando(false)
    }
  }

  const handleOAuthGoogle = () => {
    authService.iniciarSesionConOAuth('google')
  }

  const handleOAuthGithub = () => {
    authService.iniciarSesionConOAuth('github')
  }

  return (
    <main className="login-page">
      <div className="login-circles" aria-hidden="true">
        <span className="login-circle-outline" />
        <span className="login-circle-fill" />
      </div>

      <section className="login-column" aria-labelledby="login-title">
        <h1 className="login-title" id="login-title">
          Bienvenido de<br />vuelta
        </h1>

        <form className="login-form" onSubmit={handleSubmitMailPassword}>
          {errorMensaje && (
            <div className="login-error" role="alert">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMensaje}</span>
            </div>
          )}

          <div className="login-field login-field--email">
            <label htmlFor="input-mail">Correo</label>
            <input
              id="input-mail"
              type="email"
              autoComplete="email"
              required
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="login-field login-field--password">
            <label htmlFor="input-password">Contraseña</label>
            <input
              id="input-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={enviando}
            />
          </div>

          <a className="login-forgot" href="#recuperar">
            ¿Olvidaste tu contraseña?
          </a>

          <button
            className="login-primary-button"
            type="submit"
            disabled={enviando || !mail.trim() || !password}
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-divider" aria-hidden="true" />

          {/* 
                  <button
          className="login-social login-social--google"
          type="button"
          onClick={handleOAuthGoogle}
          disabled={enviando}
        >
          <span className="login-social-icon login-google-icon" aria-hidden="true">G</span>
          <span>Continuar con Google</span>
        </button>

        <button
          className="login-social login-social--github"
          type="button"
          onClick={handleOAuthGithub}
          disabled={enviando}
        >
          <span className="login-social-icon login-github-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </span>
          <span>Continuar con GitHub</span>
        </button> */}

      </section>

      <aside className="login-promo" aria-labelledby="login-promo-title">
        <h2 className="login-promo-title" id="login-promo-title">Empezá a crear</h2>
        <p>¿Aún no te registraste?</p>
        <Link to="/registro">Registrate</Link>
      </aside>
    </main>
  )
}
