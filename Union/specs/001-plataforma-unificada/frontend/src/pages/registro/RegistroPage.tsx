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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { authService } from '../../services/authService'
import './registro.css'

export interface CriteriosPassword {
  longitudMinima: boolean
  tieneMayuscula: boolean
  tieneMinuscula: boolean
  tieneNumeroOEspecial: boolean
}

export const validarPasswordEnTiempoReal = (pass: string): CriteriosPassword => {
  return {
    longitudMinima: pass.length >= 8,
    tieneMayuscula: /[A-Z]/.test(pass),
    tieneMinuscula: /[a-z]/.test(pass),
    tieneNumeroOEspecial: /[\d\W]/.test(pass),
  }
}

export const RegistroPage: React.FC = () => {
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
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
    criterios.tieneNumeroOEspecial

  const contrasenasCoinciden = password.length > 0 && password === passwordConfirmacion

  const formularioValido =
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    mail.trim().length > 0 &&
    passwordEsValida &&
    contrasenasCoinciden &&
    aceptaTerminos

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formularioValido) {
      if (!aceptaTerminos) {
        setErrorMensaje('Debés aceptar los términos y condiciones para continuar.')
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
    <div className="registro">
      <div className="div">
        <div className="auto-flex">
          <div className="auto-flex-2">
            <div className="text-wrapper-2">Crear cuenta</div>

            {errorMensaje && (
              <div role="alert" className="registro-error">
                {errorMensaje}
              </div>
            )}

            <form className="registro-form" onSubmit={handleSubmit} noValidate>
              <div className="registro-fila-doble">
                <div className="overlap-2">
                  <div className="rectangle-2" />
                  <div className="rectangle-3" />
                  <label className="text-wrapper-3" htmlFor="input-nombre">
                    Nombre
                  </label>
                  <input
                    id="input-nombre"
                    className="registro-input"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={enviando}
                    autoComplete="given-name"
                  />
                </div>

                <div className="overlap-2">
                  <div className="rectangle-2" />
                  <div className="rectangle-3" />
                  <label className="text-wrapper-3" htmlFor="input-apellido">
                    Apellido
                  </label>
                  <input
                    id="input-apellido"
                    className="registro-input"
                    type="text"
                    required
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    disabled={enviando}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="overlap-3">
                <div className="rectangle-4" />
                <div className="rectangle-6" />
                <label className="text-wrapper-4" htmlFor="input-reg-mail">
                  Correo
                </label>
                <input
                  id="input-reg-mail"
                  className="registro-input"
                  type="email"
                  autoComplete="email"
                  required
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  disabled={enviando}
                />
              </div>

              <div className="overlap-3">
                <div className="rectangle-4" />
                <div className="rectangle-5" />
                <label className="text-wrapper-4" htmlFor="input-reg-password">
                  Contraseña
                </label>
                <input
                  id="input-reg-password"
                  className="registro-input"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={enviando}
                />
              </div>

              {/* Indicadores en tiempo real de seguridad de contraseña (AC-05.2, RF-07) */}
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
                  <li className={criterios.tieneNumeroOEspecial ? 'cumple' : ''}>
                    <span>{criterios.tieneNumeroOEspecial ? '✓' : '•'}</span>
                    <span>Al menos un número o carácter especial</span>
                  </li>
                </ul>
              )}

              <div className="overlap-3">
                <div className="rectangle-4" />
                <div className="rectangle-5" />
                <label className="text-wrapper-4" htmlFor="input-reg-confirm-password">
                  Confirmar
                </label>
                <input
                  id="input-reg-confirm-password"
                  className="registro-input"
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

              <label className="p" htmlFor="input-acepta-terminos">
                <input
                  id="input-acepta-terminos"
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={enviando}
                  required
                />
                Acepto todos los términos y condiciones.
              </label>

              <button type="submit" className="botn-continuar" disabled={enviando || !formularioValido}>
                <div className="overlap-group">
                  <div className="rectangle" />
                  <div className="continuar">{enviando ? 'Creando cuenta...' : 'Registrarse'}</div>
                </div>
              </button>
            </form>

            {/* Opciones de Registro OAuth (AC-05.5) */}
            <button type="button" className="div-wrapper" onClick={handleOAuthGoogle} disabled={enviando}>
              <div className="text-wrapper-5">Continuar con Google</div>
            </button>
            <button type="button" className="overlap-4" onClick={handleOAuthGithub} disabled={enviando}>
              <div className="text-wrapper-5">Continuar con GitHub</div>
            </button>
          </div>

          <div className="overlap-5">
            <div className="ellipse" />
            <div className="ellipse-2" />
            <div className="text-wrapper-6">Empezá a crear</div>
            <div className="text-wrapper-7">¿Ya tenés una cuenta?</div>
            <button type="button" className="botn-login" onClick={() => navigate('/login')}>
              <div className="text-wrapper">Iniciar sesión</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
