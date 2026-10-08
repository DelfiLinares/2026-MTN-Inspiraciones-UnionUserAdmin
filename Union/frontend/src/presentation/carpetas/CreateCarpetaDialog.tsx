import React, { useState } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import {
  ResultadoValidacion,
  validacionOk,
  validacionError,
} from '../../application/dto/ResultadoValidacion'
import { carpetaService } from '../../services/carpetaService'

/**
 * `CreateCarpetaDialog`: Diálogo de creación de carpeta de posts guardados.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, AC-05.1–AC-05.5, A3, A6)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T039)
 *
 * Responsabilidades:
 * 1. Formulario de creación de carpeta (HU-05):
 *    - Campo: nombre de carpeta (AC-05.1)
 *    - Validaciones en cliente (AC-05.3):
 *      - No vacío
 *      - 1–15 caracteres (AC-05.2, RF-21)
 *    - Límite de 50 carpetas (AC-05.4, A6)
 *
 * 2. Validaciones de negocio:
 *    - Nombre: 1–15 caracteres, permite espacios
 *    - Unicidad: A3 (backend valida, 409 Conflict)
 *    - Límite: Máximo 50 por usuario (AC-05.4, RF-22)
 *    - Mostrar error si límite alcanzado
 *
 * 3. Integración con servicios (CarpetaService, T037/T038):
 *    - Invoca carpetaService.crearCarpeta(nombre)
 *    - Callback onSuccess: (carpeta: CarpetaPost) => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `carpetasActuales: CarpetaPost[]` — Lista de carpetas actuales (para verificar límite AC-05.4)
 * - `onSuccess: (carpeta: CarpetaPost) => void` — Callback tras crear
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no está autenticado
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta
 *
 * Criterios de aceptación:
 * - AC-05.1: Campo de nombre requerido
 * - AC-05.2: Max 15 caracteres, permite espacios
 * - AC-05.3: Validar antes de enviar
 * - AC-05.4: Deshabilitar si 50 carpetas alcanzadas
 * - AC-05.5: Mostrar carpeta nueva en lista
 *
 * Clarificaciones:
 * - A3: Backend valida unicidad de nombre (409 si duplicado)
 * - A6: Límite de 50 carpetas (RF-22)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - No hay guardado automático; requiere click en botón
 * - Si falla servidor: mostrar error específico (A3: duplicado, A6: límite)
 * - T042: Integración con CarpetaList
 */

export interface CreateCarpetaDialogProps {
  carpetasActuales: CarpetaPost[]
  onSuccess: (carpeta: CarpetaPost) => void
  onCancel: () => void
  deshabilitado?: boolean
}

/**
 * Constantes de validación.
 */
const LONGITUD_MINIMA_NOMBRE = 1
const LONGITUD_MAXIMA_NOMBRE = 15
const LIMITE_CARPETAS = 50

export const CreateCarpetaDialog: React.FC<CreateCarpetaDialogProps> = ({
  carpetasActuales,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Form state
  const [nombre, setNombre] = useState('')

  // Validation state
  const [validacion, setValidacion] = useState<ResultadoValidacion>(validacionOk())

  // Server state
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  /**
   * Validar nombre de carpeta (AC-05.2, AC-05.3).
   * Retorna ResultadoValidacion con error si es inválido.
   */
  const validarNombre = (valor: string): ResultadoValidacion => {
    const nombreTrimmed = valor.trim()

    // AC-05.3: Nombre no puede estar vacío
    if (!nombreTrimmed) {
      return validacionError('El nombre de la carpeta es obligatorio', 'nombre')
    }

    // AC-05.2: Max 15 caracteres
    if (nombreTrimmed.length > LONGITUD_MAXIMA_NOMBRE) {
      return validacionError(
        `El nombre no debe superar los ${LONGITUD_MAXIMA_NOMBRE} caracteres`,
        'nombre',
      )
    }

    // AC-05.2: Min 1 carácter (después de trim)
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
   * Manejar creación de carpeta.
   */
  const handleCrear = async () => {
    // Validar antes de enviar
    const resultadoValidacion = validarNombre(nombre)
    if (!resultadoValidacion.esValido) {
      setValidacion(resultadoValidacion)
      return
    }

    // AC-05.4: Verificar límite de 50 carpetas
    if (carpetasActuales.length >= LIMITE_CARPETAS) {
      setErrorServidor(
        `Has alcanzado el límite de ${LIMITE_CARPETAS} carpetas. Elimina una para crear otra.`,
      )
      return
    }

    // Limpiar errores previos
    setValidacion(validacionOk())
    setErrorServidor('')

    // Enviar al backend
    setEnviando(true)
    try {
      const carpetaCreada = await carpetaService.crearCarpeta(nombre)

      // AC-05.5: Notificar éxito
      onSuccess(carpetaCreada)
    } catch (error) {
      // Manejar errores del servidor
      const mensajeError = (error as any)?.message || 'Error al crear la carpeta'

      // A3: Nombre duplicado
      if (mensajeError.includes('duplicado') || mensajeError.includes('Ya tienes')) {
        setErrorServidor('Ya existe una carpeta con este nombre. Elige otro.')
      }
      // A6: Límite alcanzado (fallback si backend retorna 409)
      else if (mensajeError.includes('límite') || mensajeError.includes('50')) {
        setErrorServidor(
          `Has alcanzado el límite de ${LIMITE_CARPETAS} carpetas. Elimina una para crear otra.`,
        )
      }
      // Otros errores
      else {
        setErrorServidor(mensajeError)
      }
    } finally {
      setEnviando(false)
    }
  }

  /**
   * Manejar cancelación.
   */
  const handleCancelar = () => {
    // Limpiar estado
    setNombre('')
    setValidacion(validacionOk())
    setErrorServidor('')
    onCancel()
  }

  /**
   * Determinar si el botón de crear debe estar deshabilitado.
   */
  const crearDeshabilitado =
    !nombre.trim() ||
    !validacion.esValido ||
    enviando ||
    carpetasActuales.length >= LIMITE_CARPETAS ||
    deshabilitado

  /**
   * Determinar si ya alcanzó el límite de carpetas (AC-05.4).
   */
  const yaAlcanzoLimite = carpetasActuales.length >= LIMITE_CARPETAS

  return (
    <div className="create-carpeta-dialog">
      <div className="dialog-overlay" onClick={handleCancelar}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dialog-header">
            <h2>Crear carpeta</h2>
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
            {/* AC-05.4: Mensaje de límite alcanzado */}
            {yaAlcanzoLimite && (
              <div className="alert alert-warning">
                <p>
                  Has alcanzado el límite de {LIMITE_CARPETAS} carpetas. Elimina una para crear
                  otra.
                </p>
              </div>
            )}

            {/* Error del servidor (A3, otros) */}
            {errorServidor && (
              <div className="alert alert-error">
                <p>{errorServidor}</p>
              </div>
            )}

            {/* Campo de nombre (AC-05.1) */}
            <div className="form-group">
              <label htmlFor="nombre-carpeta">
                Nombre de carpeta <span className="required">*</span>
              </label>
              <input
                id="nombre-carpeta"
                type="text"
                placeholder="Ej: Inspiración artística"
                value={nombre}
                onChange={handleNombreChange}
                disabled={enviando || deshabilitado}
                maxLength={LONGITUD_MAXIMA_NOMBRE}
                className={validacion.esValido ? '' : 'input-error'}
              />

              {/* AC-05.2: Mostrar límite de caracteres */}
              <div className="char-counter">
                <small>
                  {nombre.length} / {LONGITUD_MAXIMA_NOMBRE} caracteres
                </small>
              </div>

              {/* AC-05.3: Mostrar error de validación */}
              {!validacion.esValido && validacion.error && (
                <div className="field-error">
                  <small>{validacion.error}</small>
                </div>
              )}
            </div>

            {/* Información de límite */}
            <div className="limit-info">
              <small>
                Carpetas actuales: {carpetasActuales.length} / {LIMITE_CARPETAS}
              </small>
            </div>
          </div>

          {/* Footer */}
          <div className="dialog-footer">
            <button className="btn btn-secondary" onClick={handleCancelar} disabled={enviando}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCrear}
              disabled={crearDeshabilitado}
            >
              {enviando ? 'Creando...' : 'Crear carpeta'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .create-carpeta-dialog {
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
          border-bottom: 1px solid #e0e0e0;
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
          color: #666;
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
          background-color: #f5f5f5;
        }

        .dialog-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 14px;
          color: #333;
        }

        .required {
          color: #e74c3c;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
          color: #999;
        }

        .form-group input.input-error {
          border-color: #e74c3c;
        }

        .char-counter {
          margin-top: 6px;
          text-align: right;
          color: #999;
          font-size: 12px;
        }

        .field-error {
          margin-top: 6px;
          color: #e74c3c;
          font-size: 12px;
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

        .alert-warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
        }

        .alert-error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .limit-info {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #666;
        }

        .dialog-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
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
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #7f8c8d;
        }
      `}</style>
    </div>
  )
}

export default CreateCarpetaDialog
