/**
 * Pantalla de Registro de Usuario (`RegistroPage.tsx`, HU-05, RF-07).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-05, AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5, RF-07)
 * - Union/specs/001-plataforma-unificada/plan.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T085)
 * - Diseño visual: Union/specs/001-plataforma-unificada/frontend_visual/Registro
 *
 * Criterios de aceptación:
 * - Solicitud de Nombre, Apellido, Email, Contraseña y Confirmación de contraseña.
 * - Validación en tiempo real de la fortaleza y criterios de la contraseña:
 *   - Mínimo 8 caracteres
 *   - Al menos una letra mayúscula
 *   - Al menos una letra minúscula
 *   - Al menos un número o carácter especial
 * - Muestra coincidencia de contraseñas.
 * - Requiere aceptar los términos y condiciones antes de registrarse.
 * - Opciones de registro OAuth (Google, GitHub) que autentican en un solo paso.
 * - Tras registro exitoso, guarda sesión y redirige al cuestionario de onboarding (`/cuestionario`).
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { authService } from '../../services/authService'
import '../login/login.css'
import './registro.css'

export interface CriteriosPassword {
  longitudMinima: boolean
  tieneMayuscula: boolean
  tieneMinuscula: boolean
  tieneNumero: boolean
  tieneCaracterEspecial: boolean
}

export const validarPasswordEnTiempoReal = (pass: string): CriteriosPassword => {
  return {
    longitudMinima: pass.length >= 8,
    tieneMayuscula: /[A-Z]/.test(pass),
    tieneMinuscula: /[a-z]/.test(pass),
    tieneNumero: /\d/.test(pass),
    tieneCaracterEspecial: /[^A-Za-z0-9]/.test(pass),
  }
}

export const RegistroPage: React.FC = () => {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const [enviando, setEnviando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const criterios = validarPasswordEnTiempoReal(password)
  const passwordEsValida =
    criterios.longitudMinima &&
    criterios.tieneMayuscula &&
    criterios.tieneMinuscula &&
    criterios.tieneNumero &&
    criterios.tieneCaracterEspecial

  const nombreUsuarioLimpio = nombreUsuario.trim()
  const nombreUsuarioEsValido = nombreUsuarioLimpio.length >= 3 && nombreUsuarioLimpio.length <= 50

  const contrasenasCoinciden = password.length > 0 && password === passwordConfirmacion

  const formularioValido =
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    nombreUsuarioEsValido &&
    mail.trim().length > 0 &&
    passwordEsValida &&
    contrasenasCoinciden &&
    aceptaTerminos

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formularioValido) {
      if (!aceptaTerminos) {
        setErrorMensaje('Debés aceptar los términos y condiciones para continuar.')
      } else if (!nombreUsuarioEsValido) {
        setErrorMensaje('El nombre de usuario debe tener entre 3 y 50 caracteres.')
      } else if (!contrasenasCoinciden) {
        setErrorMensaje('Las contraseñas no coinciden.')
      } else if (!passwordEsValida) {
        setErrorMensaje('La contraseña no cumple con los requisitos mínimos de seguridad.')
      } else {
        setErrorMensaje('Por favor, completá todos los campos requeridos.')
      }
      return
    }

    setEnviando(true)
    setErrorMensaje(null)

    try {
      const resultado = await authService.registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        username: nombreUsuarioLimpio,
        mail: mail.trim(),
        password,
        passwordConfirmacion,
      })

      iniciarSesion(resultado.usuario)
      // AC-05.4: Un registro exitoso inicia el flujo de cuestionario de onboarding
      navigate('/cuestionario')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMensaje(err.message)
      } else {
        setErrorMensaje('No se pudo completar el registro. Intentalo de nuevo más tarde.')
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
    <main className="login-page registro-page">
      <div className="login-circles registro-circles" aria-hidden="true">
        <span className="login-circle-outline" />
        <span className="login-circle-fill" />
      </div>

      <section className="login-column registro-column" aria-labelledby="registro-title">
        <h1 className="login-title registro-title" id="registro-title">
          Crear cuenta
        </h1>

        <form className="login-form registro-form" onSubmit={handleSubmit} noValidate>
          {errorMensaje && (
            <div className="login-error registro-error" role="alert">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMensaje}</span>
            </div>
          )}

          <div className="registro-name-row">
            <div className="login-field registro-field">
              <label htmlFor="input-nombre">Nombre</label>
              <input
                id="input-nombre"
                type="text"
                autoComplete="given-name"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={enviando}
              />
            </div>

            <div className="login-field registro-field">
              <label htmlFor="input-apellido">Apellido</label>
              <input
                id="input-apellido"
                type="text"
                autoComplete="family-name"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={enviando}
              />
            </div>
          </div>

          <div className="login-field registro-field">
            <label htmlFor="input-reg-username">Nombre de usuario</label>
            <input
              id="input-reg-username"
              type="text"
              autoComplete="username"
              minLength={3}
              maxLength={50}
              required
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="login-field registro-field">
            <label htmlFor="input-reg-mail">Correo</label>
            <input
              id="input-reg-mail"
              type="email"
              autoComplete="email"
              required
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="login-field registro-field registro-field--password">
            <label htmlFor="input-reg-password">Contraseña</label>
            <input
              id="input-reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={enviando}
            />
          </div>

          {password.length > 0 && (
            <ul className="registro-password-checklist">
              <li className={criterios.longitudMinima ? 'cumple' : ''}>
                <span>{criterios.longitudMinima ? '✓' : '•'}</span>
                <span>Al menos 8 caracteres</span>
              </li>
              <li className={criterios.tieneMayuscula ? 'cumple' : ''}>
                <span>{criterios.tieneMayuscula ? '✓' : '•'}</span>
                <span>Al menos una letra mayúscula</span>
              </li>
              <li className={criterios.tieneMinuscula ? 'cumple' : ''}>
                <span>{criterios.tieneMinuscula ? '✓' : '•'}</span>
                <span>Al menos una letra minúscula</span>
              </li>
              <li className={criterios.tieneNumero ? 'cumple' : ''}>
                <span>{criterios.tieneNumero ? '✓' : '•'}</span>
                <span>Al menos un número</span>
              </li>
              <li className={criterios.tieneCaracterEspecial ? 'cumple' : ''}>
                <span>{criterios.tieneCaracterEspecial ? '✓' : '•'}</span>
                <span>Al menos un carácter especial</span>
              </li>
            </ul>
          )}

          <div className="login-field registro-field">
            <label htmlFor="input-reg-confirm-password">Confirmar</label>
            <input
              id="input-reg-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={passwordConfirmacion}
              onChange={(e) => setPasswordConfirmacion(e.target.value)}
              disabled={enviando}
            />
          </div>

          {passwordConfirmacion.length > 0 && (
            <p className={`registro-password-match ${contrasenasCoinciden ? 'ok' : 'error'}`}>
              {contrasenasCoinciden ? '✓ Las contraseñas coinciden' : '✕ Las contraseñas no coinciden'}
            </p>
          )}

          <label className="registro-terms" htmlFor="input-acepta-terminos">
            <input
              id="input-acepta-terminos"
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              disabled={enviando}
              required
            />
            <span>Acepto todos los términos y condiciones.</span>
          </label>

          <button
            className="login-primary-button registro-primary-button"
            type="submit"
            disabled={enviando || !formularioValido}
          >
            {enviando ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="login-divider registro-divider" aria-hidden="true" />

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
        </button>
      </section>

      <aside className="login-promo registro-promo" aria-labelledby="registro-promo-title">
        <h2 className="login-promo-title registro-promo-title" id="registro-promo-title">
          Empezá a crear
        </h2>
        <p>¿Ya tenés una cuenta?</p>
        <Link to="/login">Iniciar sesión</Link>
      </aside>
    </main>
  )
}
