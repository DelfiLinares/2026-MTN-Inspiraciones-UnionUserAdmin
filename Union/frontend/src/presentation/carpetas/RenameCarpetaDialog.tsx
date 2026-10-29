import React, { useState } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import {
  ResultadoValidacion,
  validacionOk,
  validacionError,
} from '../../application/dto/ResultadoValidacion'
import { carpetaService } from '../../services/carpetaPerfilService'
import { ConfirmacionAccionSensibleModal } from '../shared'

/**
 * `RenameCarpetaDialog`: Diálogo de renombrado de carpeta de posts guardados.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-06, AC-06.1–AC-06.5, A3)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T040, T070)
 *
 * Responsabilidades:
 * 1. Formulario de renombrado de carpeta (HU-06):
 *    - Campo: nuevo nombre de carpeta (AC-06.1)
 *    - Validaciones en cliente (AC-06.1):
 *      - No vacío
 *      - 1–15 caracteres (RF-21)
 *      - Permite espacios
 *
 * 2. Confirmación explícita (AC-06.2, T070):
 *    - Requiere confirmación antes de ejecutar cambio
 *    - Usa ConfirmacionAccionSensibleModal (componente compartido, variante='advertencia')
 *    - Muestra cambio de nombre (de "Nombre Actual" a "Nuevo Nombre")
 *
 * 3. Validaciones de negocio:
 *    - Nombre: 1–15 caracteres, permite espacios
 *    - Unicidad: A3 (backend valida, 409 Conflict si duplicado)
 *    - AC-06.4: No altera cantidad ni contenido de posts (backend)
 *    - AC-06.5: Solo disponible sobre carpetas propias (backend: 403 si no propietario)
 *
 * 4. Integración con servicios (CarpetaService, T037/T038):
 *    - Invoca carpetaService.renombrarCarpeta(carpetaId, nombre)
 *    - Callback onSuccess: (carpeta: CarpetaPost) => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `carpeta: CarpetaPost` — Carpeta a renombrar
 * - `onSuccess: (carpeta: CarpetaPost) => void` — Callback tras renombrar
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no propietario
 *
 * Historias de usuario:
 * - HU-06: Renombrar carpeta
 *
 * Criterios de aceptación:
 * - AC-06.1: Mismas reglas que crear (1–15 chars, espacios, no vacío)
 * - AC-06.2: Confirmación explícita (T070: ConfirmacionAccionSensibleModal)
 * - AC-06.3: Refleja cambio en lista (callback notifica padre)
 * - AC-06.4: No altera cantidad/contenido (backend)
 * - AC-06.5: Solo propietario puede renombrar (backend: 403)
 *
 * Clarificaciones:
 * - A3: Backend valida unicidad de nombre (409 si duplicado)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - Confirmación explícita usa ConfirmacionAccionSensibleModal (T070)
 * - Si falla servidor: mostrar error específico (A3: duplicado, AC-06.5: 403)
 * - T070: Integración con ConfirmacionAccionSensibleModal para confirmación
 */

export interface RenameCarpetaDialogProps {
  carpeta: CarpetaPost
  onSuccess: (carpeta: CarpetaPost) => void
  onCancel: () => void
  deshabilitado?: boolean
}

/**
 * Constantes de validación.
 */
const LONGITUD_MINIMA_NOMBRE = 1
const LONGITUD_MAXIMA_NOMBRE = 15

export const RenameCarpetaDialog: React.FC<RenameCarpetaDialogProps> = ({
  carpeta,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Form state (inicializar con nombre actual)
  const [nombre, setNombre] = useState(carpeta.nombre)

  // Validation state
  const [validacion, setValidacion] = useState<ResultadoValidacion>(validacionOk())

  // Server state
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  // Confirmation modal state (T070: ConfirmacionAccionSensibleModal)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [nombrePendiente, setNombrePendiente] = useState<string>('')

  /**
   * Validar nombre de carpeta (AC-06.1).
   * Retorna ResultadoValidacion con error si es inválido.
   */
  const validarNombre = (valor: string): ResultadoValidacion => {
    const nombreTrimmed = valor.trim()

    // AC-06.1: Nombre no puede estar vacío
    if (!nombreTrimmed) {
      return validacionError('El nombre de la carpeta es obligatorio', 'nombre')
    }

    // AC-06.1: Max 15 caracteres
    if (nombreTrimmed.length > LONGITUD_MAXIMA_NOMBRE) {
      return validacionError(
        `El nombre no debe superar los ${LONGITUD_MAXIMA_NOMBRE} caracteres`,
        'nombre',
      )
    }

    // AC-06.1: Min 1 carácter (después de trim)
    if (nombreTrimmed.length < LONGITUD_MINIMA_NOMBRE) {
      return validacionError(
        `El nombre debe tener al menos ${LONGITUD_MINIMA_NOMBRE} carácter`,
        'nombre',
      )
    }

    return validacionOk()
  }

  /**
   * Manejar cambio en campo de nombre.
   */
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setNombre(valor)
    // Validar mientras escribe (feedback inmediato)
    if (valor) {
      setValidacion(validarNombre(valor))
    } else {
      setValidacion(validacionOk())
    }
  }

  /**
   * Manejar renombrado de carpeta (AC-06.2, T070: mostrar confirmación modal).
   * Primero valida, luego muestra modal de confirmación.
   */
  const handleConfirmar = () => {
    // Validar antes de mostrar modal
    const resultadoValidacion = validarNombre(nombre)
    if (!resultadoValidacion.esValido) {
      setValidacion(resultadoValidacion)
      return
    }

    // Si el nombre no cambió, cancelar sin hacer nada
    if (nombre.trim() === carpeta.nombre) {
      onCancel()
      return
    }

    // Limpiar errores previos
    setErrorServidor('')

    // Mostrar modal de confirmación (T070)
    setNombrePendiente(nombre.trim())
    setMostrarConfirmacion(true)
  }

  /**
   * Confirmar renombrado tras confirmación modal (T070).
   */
  const handleConfirmarRenombre = async () => {
    if (!nombrePendiente) return

    setEnviando(true)
    try {
      const carpetaRenombrada = await carpetaService.renombrarCarpeta(
        carpeta.id,
        nombrePendiente,
      )

      // AC-06.3: Notificar éxito
      setMostrarConfirmacion(false)
      onSuccess(carpetaRenombrada)
    } catch (error) {
      // Manejar errores del servidor
      const mensajeError = (error as any)?.message || 'Error al renombrar la carpeta'

      // A3: Nombre duplicado
      if (mensajeError.includes('duplicado') || mensajeError.includes('Ya tienes')) {
        setErrorServidor('Ya existe una carpeta con este nombre. Elige otro.')
      }
      // AC-06.5: No es propietario (403)
      else if (mensajeError.includes('No tienes permisos')) {
        setErrorServidor('No tienes permisos para renombrar esta carpeta.')
      }
      // Otros errores
      else {
        setErrorServidor(mensajeError)
      }

      // Mantener modal abierta para reintentar
      setMostrarConfirmacion(false)
    } finally {
      setEnviando(false)
      setNombrePendiente('')
    }
  }

  /**
   * Manejar cancelación.
   */
  const handleCancelar = () => {
    // Limpiar estado
    setNombre(carpeta.nombre)
    setValidacion(validacionOk())
    setErrorServidor('')
    onCancel()
  }

  /**
   * Determinar si el botón de confirmar debe estar deshabilitado.
   */
  const confirmarDeshabilitado =
    !nombre.trim() ||
    !validacion.esValido ||
    enviando ||
    nombre.trim() === carpeta.nombre ||
    deshabilitado

  return (
    <div className="rename-carpeta-dialog">
      <div className="dialog-overlay" onClick={handleCancelar}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dialog-header">
            <h2>Renombrar carpeta</h2>
            <button
              className="close-button"
              onClick={handleCancelar}
              aria-label="Cerrar diálogo"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="dialog-body">
            {/* Nombre actual */}
            <div className="current-name">
              <p>
                Nombre actual: <strong>{carpeta.nombre}</strong>
              </p>
            </div>

            {/* Error del servidor (A3, AC-06.5, otros) */}
            {errorServidor && (
              <div className="alert alert-error">
                <p>{errorServidor}</p>
              </div>
            )}

            {/* Campo de nombre (AC-06.1) */}
            <div className="form-group">
              <label htmlFor="nuevo-nombre-carpeta">
                Nuevo nombre <span className="required">*</span>
              </label>
              <input
                id="nuevo-nombre-carpeta"
                type="text"
                placeholder="Ej: Inspiración artística"
                value={nombre}
                onChange={handleNombreChange}
                disabled={enviando || deshabilitado}
                maxLength={LONGITUD_MAXIMA_NOMBRE}
                className={validacion.esValido ? '' : 'input-error'}
              />

              {/* AC-06.1: Mostrar límite de caracteres */}
              <div className="char-counter">
                <small>
                  {nombre.length} / {LONGITUD_MAXIMA_NOMBRE} caracteres
                </small>
              </div>

              {/* AC-06.1: Mostrar error de validación */}
              {!validacion.esValido && validacion.error && (
                <div className="field-error">
                  <small>{validacion.error}</small>
                </div>
              )}
            </div>

            {/* Información sobre cambio */}
            <div className="info-cambio">
              <small>
                {nombre.trim() === carpeta.nombre
                  ? 'Sin cambios'
                  : '✓ Nuevo nombre listo para confirmar'}
              </small>
            </div>
          </div>

          {/* Footer con botones de confirmación explícita (AC-06.2) */}
          <div className="dialog-footer">
            <button className="btn btn-secondary" onClick={handleCancelar} disabled={enviando}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmar}
              disabled={confirmarDeshabilitado}
            >
              {enviando ? 'Renombrando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .rename-carpeta-dialog {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
        }

        .dialog-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }

        .dialog-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          max-width: 400px;
          width: 90%;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--trama-line);
        }

        .dialog-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--trama-muted);
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: var(--trama-subtle);
        }

        .dialog-body {
          padding: 20px;
        }

        .current-name {
          padding: 12px;
          background-color: var(--trama-subtle);
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .current-name p {
          margin: 0;
          color: var(--trama-muted);
        }

        .current-name strong {
          color: var(--trama-ink);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
          color: var(--trama-ink);
        }

        .required {
          color: var(--trama-error);
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--trama-control);
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--trama-muted);
          box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.15);
        }

        .form-group input:disabled {
          background-color: var(--trama-subtle);
          cursor: not-allowed;
          color: var(--trama-muted);
        }

        .form-group input.input-error {
          border-color: var(--trama-error);
        }

        .char-counter {
          margin-top: 6px;
          text-align: right;
          color: var(--trama-muted);
          font-size: 14px;
        }

        .field-error {
          margin-top: 6px;
          color: var(--trama-error);
          font-size: 14px;
        }

        .info-cambio {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--trama-line);
          text-align: center;
          color: var(--trama-muted);
        }

        .alert {
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .alert p {
          margin: 0;
        }

        .alert-error {
          background-color: var(--trama-error-surface);
          border: 1px solid var(--trama-error);
          color: var(--trama-error);
        }

        .dialog-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid var(--trama-line);
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: var(--trama-muted);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: var(--trama-ink);
        }

        .btn-secondary {
          background-color: var(--trama-muted);
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: var(--trama-ink);
        }
      `}</style>

      {/* T070: Modal de confirmación de renombrado (ConfirmacionAccionSensibleModal) */}
      <ConfirmacionAccionSensibleModal
        abierto={mostrarConfirmacion}
        titulo="Confirmar cambio de nombre"
        mensaje={`¿Cambiar el nombre de la carpeta de "${carpeta.nombre}" a "${nombrePendiente}"?`}
        variante="advertencia"
        textoConfirmar="Sí, cambiar"
        textoCancelar="Cancelar"
        confirmando={enviando}
        onConfirmar={handleConfirmarRenombre}
        onCancelar={() => {
          setMostrarConfirmacion(false)
          setNombrePendiente('')
        }}
      />
    </div>
  )
}

export default RenameCarpetaDialog

