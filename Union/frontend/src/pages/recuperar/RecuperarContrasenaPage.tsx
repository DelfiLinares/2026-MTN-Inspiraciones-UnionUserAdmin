/**
 * Pantalla de recuperación de contraseña (spec 008, HU-01…04, HU-07, RF-01…RF-07, RF-10, RF-12).
 * Asistente de dos pasos: email → código + nueva contraseña. El estado vive solo en memoria (A-12).
 */

import React, { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { recoveryService as servicioPorDefecto } from '../../application/recoveryService'
import type { RecoveryService } from '../../application/recoveryService'
import { useCooldown } from '../../application/useCooldown'
import {
  CodigoErrorRecuperacion,
  CodigoOtp,
  COOLDOWN_REENVIO_SEGUNDOS,
  EmailRecuperacion,
  LONGITUD_CODIGO_OTP,
  NuevaContrasena,
  PasoRecuperacion,
  VIGENCIA_CODIGO_MINUTOS,
  mapearErrorRecuperacion,
} from '../../domain/recuperacion'
import type { ErrorRecuperacion } from '../../domain/recuperacion'
import './recuperacion.css'

export const MENSAJE_RESTABLECIMIENTO_OK = 'Contraseña actualizada. Iniciá sesión con tu nueva contraseña.'
export const MENSAJE_SOLICITUD_NEUTRO =
  'Si el correo está registrado, recibirás un código de verificación.'

interface Props {
  service?: RecoveryService
}

export const RecuperarContrasenaPage: React.FC<Props> = ({ service = servicioPorDefecto }) => {
  const navigate = useNavigate()
  const cooldown = useCooldown()
  const refEmail = useRef<HTMLInputElement>(null)
  const refCodigo = useRef<HTMLInputElement>(null)
  const refNueva = useRef<HTMLInputElement>(null)
  const refConfirmacion = useRef<HTMLInputElement>(null)

  const [paso, setPaso] = useState<PasoRecuperacion>(PasoRecuperacion.SOLICITAR_CODIGO)
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState<ErrorRecuperacion | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const requisitosFaltantes = NuevaContrasena.requisitosFaltantes(nueva)
  const puedeConfirmar =
    CodigoOtp.esValido(codigo) &&
    requisitosFaltantes.length === 0 &&
    nueva === confirmacion &&
    !enviando

  const fallarConCampo = (mensaje: string, ref: React.RefObject<HTMLInputElement>) => {
    setError({ codigo: CodigoErrorRecuperacion.VALIDACION, mensaje })
    ref.current?.focus()
  }

  const pedirCodigo = async (): Promise<boolean> => {
    setEnviando(true)
    setError(null)
    try {
      await service.solicitarCodigo(email)
      cooldown.iniciar(COOLDOWN_REENVIO_SEGUNDOS)
      return true
    } catch (e) {
      const detalle = mapearErrorRecuperacion(e)
      setError(detalle)
      if (detalle.esperaSegundos) cooldown.iniciar(detalle.esperaSegundos)
      return false
    } finally {
      setEnviando(false)
    }
  }

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    if (!EmailRecuperacion.esValido(email)) {
      fallarConCampo('Ingresá un correo electrónico válido.', refEmail)
      return
    }
    if (await pedirCodigo()) {
      setAviso(MENSAJE_SOLICITUD_NEUTRO)
      setPaso(PasoRecuperacion.INGRESAR_CODIGO)
    }
  }

  const handleReenviar = async () => {
    if (enviando || cooldown.activo) return
    setAviso(null)
    if (await pedirCodigo()) {
      setCodigo('')
      setAviso('Si el correo está registrado, te enviamos un código nuevo.')
    }
  }

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enviando) return
    if (!CodigoOtp.esValido(codigo)) {
      fallarConCampo(`Ingresá el código de ${LONGITUD_CODIGO_OTP} dígitos.`, refCodigo)
      return
    }
    if (requisitosFaltantes.length > 0) {
      fallarConCampo('La contraseña no cumple los requisitos.', refNueva)
      return
    }
    if (nueva !== confirmacion) {
      fallarConCampo('Las contraseñas no coinciden.', refConfirmacion)
      return
    }

    setEnviando(true)
    setError(null)
    setAviso(null)
    try {
      await service.confirmar({ email, codigo, nuevaContrasena: nueva, confirmacion })
      setCodigo('')
      setNueva('')
      setConfirmacion('')
      navigate('/login', { replace: true, state: { mensajeExito: MENSAJE_RESTABLECIMIENTO_OK } })
    } catch (err) {
      const detalle = mapearErrorRecuperacion(err)
      setError(detalle)
      if (detalle.esperaSegundos) cooldown.iniciar(detalle.esperaSegundos)
      if (detalle.codigo === CodigoErrorRecuperacion.VALIDACION) refCodigo.current?.focus()
    } finally {
      setEnviando(false)
    }
  }

  const requiereCodigoNuevo =
    error?.codigo === CodigoErrorRecuperacion.OTP_EXPIRADO ||
    error?.codigo === CodigoErrorRecuperacion.OTP_AGOTADO

  const bloqueoError = error && (
    <div className="recuperacion-error" role="alert">
      <span>{error.mensaje}</span>
    </div>
  )

  return (
    <main className="recuperacion-page">
      <section className="recuperacion-card" aria-labelledby="recuperacion-titulo">
        <h1 id="recuperacion-titulo" className="recuperacion-title">Recuperá tu contraseña</h1>

        {paso === PasoRecuperacion.SOLICITAR_CODIGO && (
          <form className="recuperacion-form" onSubmit={handleSolicitar} noValidate>
            <p className="recuperacion-help">
              Ingresá el correo de tu cuenta y te enviaremos un código de {LONGITUD_CODIGO_OTP} dígitos.
            </p>
            {bloqueoError}
            <div className="recuperacion-field">
              <label htmlFor="recuperacion-email">Correo</label>
              <input
                id="recuperacion-email"
                ref={refEmail}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={enviando}
                aria-invalid={error?.codigo === CodigoErrorRecuperacion.VALIDACION}
              />
            </div>
            <button className="recuperacion-primary" type="submit" disabled={enviando || !email.trim()}>
              {enviando ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {paso === PasoRecuperacion.INGRESAR_CODIGO && (
          <form className="recuperacion-form" onSubmit={handleConfirmar} noValidate>
            {aviso && (
              <p className="recuperacion-aviso" role="status">{aviso}</p>
            )}
            <p className="recuperacion-help">
              Ingresá el código de {LONGITUD_CODIGO_OTP} dígitos (vence en {VIGENCIA_CODIGO_MINUTOS} minutos) y elegí tu nueva contraseña.
            </p>
            {bloqueoError}

            <div className="recuperacion-field">
              <label htmlFor="recuperacion-codigo">Código</label>
              <input
                id="recuperacion-codigo"
                ref={refCodigo}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={codigo}
                onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, '').slice(0, LONGITUD_CODIGO_OTP))}
                disabled={enviando}
              />
            </div>

            <div className="recuperacion-field">
              <label htmlFor="recuperacion-nueva">Nueva contraseña</label>
              <input
                id="recuperacion-nueva"
                ref={refNueva}
                type={mostrar ? 'text' : 'password'}
                autoComplete="new-password"
                value={nueva}
                onChange={(ev) => setNueva(ev.target.value)}
                disabled={enviando}
                aria-describedby="recuperacion-requisitos"
              />
            </div>

            <ul id="recuperacion-requisitos" className="recuperacion-requisitos">
              {requisitosFaltantes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>

            <div className="recuperacion-field">
              <label htmlFor="recuperacion-confirmacion">Repetí la contraseña</label>
              <input
                id="recuperacion-confirmacion"
                ref={refConfirmacion}
                type={mostrar ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmacion}
                onChange={(ev) => setConfirmacion(ev.target.value)}
                disabled={enviando}
              />
            </div>

            <label className="recuperacion-check">
              <input type="checkbox" checked={mostrar} onChange={(ev) => setMostrar(ev.target.checked)} />
              Mostrar contraseña
            </label>

            <button className="recuperacion-primary" type="submit" disabled={!puedeConfirmar}>
              {enviando ? 'Guardando...' : 'Cambiar contraseña'}
            </button>

            <button
              className="recuperacion-secondary"
              type="button"
              onClick={handleReenviar}
              disabled={enviando || cooldown.activo}
            >
              {cooldown.activo
                ? `Reenviar código en ${cooldown.restantes} s`
                : requiereCodigoNuevo
                  ? 'Pedir un código nuevo'
                  : 'Reenviar código'}
            </button>
          </form>
        )}

        <p className="recuperacion-links">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </section>
    </main>
  )
}
