import React, { useState, useCallback } from 'react'
import { Usuario } from '../../domain/Usuario'
import { ResultadoValidacion, validacionOk, validacionError } from '../../application/dto/ResultadoValidacion'
import { ActualizarPerfilPayload, tieneAlgunCampoActualizar } from '../../application/dto/ActualizarPerfilPayload'
import { usuarioPerfilService } from '../../services/perfilService'

/**
 * `EditarPerfilForm`: Formulario de edición de datos personales.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, AC-02.1–AC-02.8, A1)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T022, T032)
 *
 * Responsabilidades:
 * 1. Formulario de edición de 4 campos (AC-02.1):
 *    - Foto de perfil (T023, componente separado PhotoUploadField)
 *    - Nombre de usuario
 *    - Sobre mí
 *    - Descripción
 *
 * 2. Validaciones en cliente (AC-02.2–AC-02.5):
 *    - Username: [A-Za-z0-9_.], 1–10 chars, no espacios (AC-02.2, AC-02.3, A1)
 *    - Sobre mí: ≤80 chars, espacios permitidos (AC-02.4)
 *    - Descripción: ≤200 chars, espacios permitidos (AC-02.5)
 *
 * 3. Confirmación explícita de cambio de username (AC-02.6):
 *    - Si username cambió, mostrar modal de confirmación
 *    - Backend valida uniqueness (A1, authoritative)
 *
 * 4. Manejo de errores (AC-02.7, AC-02.8):
 *    - AC-02.7: Validación falla → mostrar error específico por campo
 *    - AC-02.8: Error servidor → mostrar mensaje, preservar datos en form
 *
 * 5. Integración con servicios (T032: UsuarioPerfilService):
 *    - Invoca usuarioPerfilService.actualizarPerfil() directamente
 *    - Callback onCancel: () => void — Opcional
 *    - Callback onFotoChanged: (fotoUrl: string) => void — Opcional (T023)
 *    - Callback onPerfilActualizado: (usuario: Usuario) => void — Opcional
 *
 * Props:
 * - `usuario: Usuario` — Usuario actual cuyos datos se editan
 * - `onCancel?: () => void` — Callback de cancelación
 * - `onFotoChanged?: (fotoUrl: string) => void` — Callback cuando foto cambia (T023)
 * - `onPerfilActualizado?: (usuario: Usuario) => void` — Callback después de guardar (T032)
 *
 * Historias de usuario:
 * - HU-02: Editar perfil propio
 *
 * Criterios de aceptación:
 * - AC-02.1: Editar 4 campos
 * - AC-02.2–AC-02.5: Validaciones de formato
 * - AC-02.6: Confirmación de cambio de username
 * - AC-02.7: Mostrar errores de validación
 * - AC-02.8: Preservar datos si falla servidor
 *
 * Clarificaciones:
 * - A1: Backend valida uniqueness de username
 * - Foto es T023 (PhotoUploadField separado)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo formulario (Principio VI)
 * - No hay guardado automático; requiere click en botón
 * - Los datos se preservan localmente si falla servidor (AC-02.8)
 * - T032: Integración con UsuarioPerfilService
 */

export interface EditarPerfilFormProps {
  usuario: Usuario
  onCancel?: () => void
  onFotoChanged?: (fotoUrl: string) => void
  onPerfilActualizado?: (usuario: Usuario) => void
}

export const EditarPerfilForm: React.FC<EditarPerfilFormProps> = ({
  usuario,
  onCancel,
  onFotoChanged,
  onPerfilActualizado,
}) => {
  // Form state
  const [nombreUsuario, setNombreUsuario] = useState(usuario.username)
  const [sobreMi, setSobreMi] = useState(usuario.sobreMi)
  const [descripcion, setDescripcion] = useState(usuario.descripcion)

  // Validation state
  const [errores, setErrores] = useState<Record<string, string>>({})

  // Server state (T032: Integración con UsuarioPerfilService)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  // Confirmation state for username change (AC-02.6)
  const [mostrarConfirmacionUsername, setMostrarConfirmacionUsername] = useState(false)
  const [payloadPendiente, setPayloadPendiente] = useState<ActualizarPerfilPayload | null>(null)

  /**
   * Validar campo de username (AC-02.2, AC-02.3, A1).
   * Backend es authoritative para uniqueness (A1).
   */
  const validarUsername = (value: string): ResultadoValidacion => {
    if (!value || value.length === 0) {
      return validacionError('El nombre de usuario es requerido', 'nombreUsuario')
    }

    if (value.length > 10) {
      return validacionError('El nombre de usuario no debe superar 10 caracteres', 'nombreUsuario')
    }

    // AC-02.2: Patrón [A-Za-z0-9_.]
    if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
      return validacionError(
        'El nombre de usuario solo puede contener letras, números, guiones bajos (_) y puntos (.)',
        'nombreUsuario',
      )
    }

    return validacionOk()
  }

  /**
   * Validar campo "Sobre mí" (AC-02.4).
   */
  const validarSobreMi = (value: string): ResultadoValidacion => {
    if (value && value.length > 80) {
      return validacionError('"Sobre mí" no debe superar 80 caracteres', 'sobreMi')
    }
    return validacionOk()
  }

  /**
   * Validar campo "Descripción" (AC-02.5).
   */
  const validarDescripcion = (value: string): ResultadoValidacion => {
    if (value && value.length > 200) {
      return validacionError('La descripción no debe superar 200 caracteres', 'descripcion')
    }
    return validacionOk()
  }

  /**
   * AC-02.7: Validar todo el formulario.
   * Retorna true si todo es válido, false si hay errores.
   */
  const validarFormulario = (): boolean => {
    const erroresLocales: Record<string, string> = {}

    const resultUsername = validarUsername(nombreUsuario)
    if (!resultUsername.esValido) {
      erroresLocales[resultUsername.campo || 'nombreUsuario'] = resultUsername.error || ''
    }

    const resultSobreMi = validarSobreMi(sobreMi)
    if (!resultSobreMi.esValido) {
      erroresLocales[resultSobreMi.campo || 'sobreMi'] = resultSobreMi.error || ''
    }

    const resultDescripcion = validarDescripcion(descripcion)
    if (!resultDescripcion.esValido) {
      erroresLocales[resultDescripcion.campo || 'descripcion'] = resultDescripcion.error || ''
    }

    setErrores(erroresLocales)
    return Object.keys(erroresLocales).length === 0
  }

  /**
   * AC-02.6: Confirmar cambio de username si es necesario.
   * Si username cambió, mostrar modal. Si no cambió, guardar directo.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validarFormulario()) {
      return
    }

    // Build payload
    const payload: ActualizarPerfilPayload = {}

    // Agregar campos solo si cambiaron
    if (nombreUsuario !== usuario.username) {
      payload.nombreUsuario = nombreUsuario
    }
    if (sobreMi !== usuario.sobreMi) {
      payload.sobreMi = sobreMi
    }
    if (descripcion !== usuario.descripcion) {
      payload.descripcion = descripcion
    }

    // AC-02.1: Validar que hay al menos un campo para actualizar
    if (!tieneAlgunCampoActualizar(payload)) {
      setErrores({ general: 'No hay cambios para guardar' })
      return
    }

    // AC-02.6: Si username cambió, pedir confirmación explícita
    if (nombreUsuario !== usuario.username) {
      setPayloadPendiente(payload)
      setMostrarConfirmacionUsername(true)
      return
    }

    // Si no hay cambio de username, guardar directamente
    await guardarPerfil(payload)
  }

  /**
   * Confirmar cambio de username y guardar.
   */
  const handleConfirmarUsername = async () => {
    setMostrarConfirmacionUsername(false)
    if (payloadPendiente) {
      await guardarPerfil(payloadPendiente)
      setPayloadPendiente(null)
    }
  }

  /**
   * AC-02.8: Enviar cambios al servidor usando UsuarioPerfilService.
   * Si falla, preservar datos en formulario y mostrar error (AC-02.8).
   * Si éxito, invocar callback opcional onPerfilActualizado.
   * T032: Integración con UsuarioPerfilService.
   */
  const guardarPerfil = async (payload: ActualizarPerfilPayload) => {
    setEnviando(true)
    setErrorServidor('')

    try {
      // T032: Invocar UsuarioPerfilService.actualizarPerfil()
      const usuarioActualizado = await usuarioPerfilService.actualizarPerfil(payload)

      // Éxito: invocar callback opcional
      if (onPerfilActualizado) {
        onPerfilActualizado(usuarioActualizado)
      }

      // Opcional: cerrar formulario o hacer algo más
      if (onCancel) {
        onCancel()
      }
    } catch (err) {
      // AC-02.8: Error servidor → mostrar mensaje, preservar datos en form
      const mensaje = err instanceof Error ? err.message : 'Error al guardar perfil'
      setErrorServidor(mensaje)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937' }}>
        Editar Perfil
      </h2>

      {/* AC-02.8: Mostrar error del servidor */}
      {errorServidor && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '13px',
            color: '#991b1b',
          }}
        >
          {errorServidor}
        </div>
      )}

      {/* AC-02.7: Mostrar error general */}
      {errores.general && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '13px',
            color: '#991b1b',
          }}
        >
          {errores.general}
        </div>
      )}

      {/* AC-02.1: Campo Nombre de Usuario */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="nombreUsuario"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}
        >
          Nombre de usuario *
        </label>
        <input
          id="nombreUsuario"
          type="text"
          value={nombreUsuario}
          onChange={(e) => {
            setNombreUsuario(e.target.value)
            if (errores.nombreUsuario) {
              setErrores((prev) => {
                const newErrores = { ...prev }
                delete newErrores.nombreUsuario
                return newErrores
              })
            }
          }}
          disabled={enviando}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: errores.nombreUsuario ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
          maxLength={10}
        />
        {errores.nombreUsuario && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#dc2626' }}>
            {errores.nombreUsuario}
          </p>
        )}
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#6b7280' }}>
          Máximo 10 caracteres, sin espacios. Solo letras, números, guiones bajos y puntos.
        </p>
      </div>

      {/* AC-02.1: Campo Sobre mí */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="sobreMi"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}
        >
          Sobre mí
        </label>
        <textarea
          id="sobreMi"
          value={sobreMi}
          onChange={(e) => {
            setSobreMi(e.target.value.substring(0, 80))
            if (errores.sobreMi) {
              setErrores((prev) => {
                const newErrores = { ...prev }
                delete newErrores.sobreMi
                return newErrores
              })
            }
          }}
          disabled={enviando}
          rows={2}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: errores.sobreMi ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
          maxLength={80}
        />
        {errores.sobreMi && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#dc2626' }}>
            {errores.sobreMi}
          </p>
        )}
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#6b7280' }}>
          {sobreMi.length}/80 caracteres
        </p>
      </div>

      {/* AC-02.1: Campo Descripción */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="descripcion"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value.substring(0, 200))
            if (errores.descripcion) {
              setErrores((prev) => {
                const newErrores = { ...prev }
                delete newErrores.descripcion
                return newErrores
              })
            }
          }}
          disabled={enviando}
          rows={4}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: errores.descripcion ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
          maxLength={200}
        />
        {errores.descripcion && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#dc2626' }}>
            {errores.descripcion}
          </p>
        )}
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#6b7280' }}>
          {descripcion.length}/200 caracteres
        </p>
      </div>

      {/* TODO (T023): PhotoUploadField para cambio de foto */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
          📷 Cambio de foto: Usar componente PhotoUploadField (T023)
        </p>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={enviando}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: enviando ? 'not-allowed' : 'pointer',
            opacity: enviando ? 0.6 : 1,
          }}
        >
          {enviando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={enviando}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: enviando ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      {/* AC-02.6: Modal de confirmación de cambio de username */}
      {mostrarConfirmacionUsername && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '400px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              Confirmar cambio de nombre de usuario
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '13px', color: '#6b7280' }}>
              ¿Cambiar tu nombre de usuario de <strong>@{usuario.username}</strong> a <strong>@{nombreUsuario}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleConfirmarUsername}
                disabled={enviando}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}
              >
                Sí, cambiar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmacionUsername(false)
                  setPayloadPendiente(null)
                }}
                disabled={enviando}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
