/**
 * Pantalla de apelación de cuenta suspendida (spec 008, HU-06, RF-09).
 * Se autentica con email + contraseña porque una cuenta suspendida no puede iniciar sesión (A-8).
 */

import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { recoveryService as servicioPorDefecto } from '../../application/recoveryService'
import type { RecoveryService } from '../../application/recoveryService'
import {
  EmailRecuperacion,
  LONGITUD_MAXIMA_MENSAJE_APELACION,
  LONGITUD_MINIMA_MENSAJE_APELACION,
  MensajeApelacion,
  mapearErrorRecuperacion,
} from '../../domain/recuperacion'
import '../recuperar/recuperacion.css'

interface Props {
  service?: RecoveryService
}

export const ApelarSuspensionPage: React.FC<Props> = ({ service = servicioPorDefecto }) => {
  const refEmail = useRef<HTMLInputElement>(null)
  const refPassword = useRef<HTMLInputElement>(null)
  const refMensaje = useRef<HTMLTextAreaElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)

  const formularioValido =
    EmailRecuperacion.esValido(email) && password.length > 0 && MensajeApelacion.esValido(mensaje)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    if (!EmailRecuperacion.esValido(email)) {
      setError('Ingresá un correo electrónico válido.')
      refEmail.current?.focus()
      return
    }
    if (!password) {
      setError('Ingresá tu contraseña.')
      refPassword.current?.focus()
      return
    }
    if (!MensajeApelacion.esValido(mensaje)) {
      setError(
        `El mensaje debe tener entre ${LONGITUD_MINIMA_MENSAJE_APELACION} y ${LONGITUD_MAXIMA_MENSAJE_APELACION} caracteres.`,
      )
      refMensaje.current?.focus()
      return
    }

    setEnviando(true)
    setError(null)
    try {
      await service.apelar({ email, password, mensaje })
      setPassword('')
      setEnviada(true)
    } catch (err) {
      setError(mapearErrorRecuperacion(err).mensaje)
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) {
    return (
      <main className="recuperacion-page">
        <section className="recuperacion-card" aria-labelledby="apelacion-titulo">
          <h1 id="apelacion-titulo" className="recuperacion-title">Apelación recibida</h1>
          <p className="recuperacion-aviso" role="status">
            Un administrador revisará tu caso. Te avisaremos por correo cuando haya una decisión.
          </p>
          <p className="recuperacion-links">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="recuperacion-page">
      <section className="recuperacion-card" aria-labelledby="apelacion-titulo">
        <h1 id="apelacion-titulo" className="recuperacion-title">Apelar suspensión</h1>

        <form className="recuperacion-form" onSubmit={handleSubmit} noValidate>
          <p className="recuperacion-help">
            Contanos por qué creés que la suspensión de tu cuenta debería revisarse.
          </p>
          {error && (
            <div className="recuperacion-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          <div className="recuperacion-field">
            <label htmlFor="apelacion-email">Correo</label>
            <input
              id="apelacion-email"
              ref={refEmail}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="recuperacion-field">
            <label htmlFor="apelacion-password">Contraseña</label>
            <input
              id="apelacion-password"
              ref={refPassword}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="recuperacion-field">
            <label htmlFor="apelacion-mensaje">Mensaje</label>
            <textarea
              id="apelacion-mensaje"
              ref={refMensaje}
              value={mensaje}
              maxLength={LONGITUD_MAXIMA_MENSAJE_APELACION}
              onChange={(ev) => setMensaje(ev.target.value)}
              disabled={enviando}
              aria-describedby="apelacion-contador"
            />
            <span id="apelacion-contador" className="recuperacion-contador">
              {mensaje.trim().length}/{LONGITUD_MAXIMA_MENSAJE_APELACION} (mínimo {LONGITUD_MINIMA_MENSAJE_APELACION})
            </span>
          </div>

          <button className="recuperacion-primary" type="submit" disabled={enviando || !formularioValido}>
            {enviando ? 'Enviando...' : 'Enviar apelación'}
          </button>
        </form>

        <p className="recuperacion-links">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </section>
    </main>
  )
}
