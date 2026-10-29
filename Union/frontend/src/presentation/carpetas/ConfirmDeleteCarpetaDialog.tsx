import React, { useState } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { carpetaService } from '../../services/carpetaPerfilService'
import { ConfirmacionAccionSensibleModal } from '../shared'

/**
 * `ConfirmDeleteCarpetaDialog`: Diálogo de confirmación de eliminación de carpeta.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-07, AC-07.1–AC-07.7, A7)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T041, T071)
 *
 * Responsabilidades:
 * 1. Confirmación explícita de eliminación (HU-07, AC-07.1, T071):
 *    - Requiere confirmación explícita antes de eliminar
 *    - Usa ConfirmacionAccionSensibleModal (componente compartido, variante='peligro')
 *    - Mantiene advertencia completa de A7
 *
 * 2. Advertencias claras (AC-07.2, AC-07.3, A7, T071):
 *    - AC-07.2: Advierte que el contenido guardado en la carpeta se perderá
 *    - AC-07.3: Aclara que los posts originales NO se eliminan de la plataforma
 *    - A7: Información clara y diferenciada visualmente en modal
 *
 * 3. Diferenciación visual (AC-07.7):
 *    - Modal con variante='peligro' (rojo, icono de advertencia)
 *    - Distinto de acciones de consulta o cambio
 *
 * 4. Integración con servicios (CarpetaService, T037/T038):
 *    - Invoca carpetaService.eliminarCarpeta(carpetaId)
 *    - Callback onSuccess: () => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `carpeta: CarpetaPost` — Carpeta a eliminar
 * - `onSuccess: () => void` — Callback tras eliminar
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no propietario
 *
 * Historias de usuario:
 * - HU-07: Eliminar carpeta
 *
 * Criterios de aceptación:
 * - AC-07.1: Confirmación explícita (T071: ConfirmacionAccionSensibleModal)
 * - AC-07.2: Advierte pérdida de contenido guardado
 * - AC-07.3: Aclara que posts originales no se eliminan
 * - AC-07.4: Callback notifica eliminación (se refleja en lista T044)
 * - AC-07.5: Backend libera cupo (implementado en T037/T038)
 * - AC-07.6: Solo propietario puede eliminar (backend: 403)
 * - AC-07.7: Diferenciación visual (variante='peligro' en modal)
 *
 * Clarificaciones:
 * - A7: Información clara sobre pérdida de guardados (mantener en T071)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - Acción destructiva: requiere confirmación explícita y diferenciación visual
 * - Si falla servidor: mostrar error específico (AC-07.6: 403)
 * - T071: Integración con ConfirmacionAccionSensibleModal para confirmación de eliminación
 */

export interface ConfirmDeleteCarpetaDialogProps {
  carpeta: CarpetaPost
  onSuccess: () => void
  onCancel: () => void
  deshabilitado?: boolean
}

export const ConfirmDeleteCarpetaDialog: React.FC<ConfirmDeleteCarpetaDialogProps> = ({
  carpeta,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Server state
  const [eliminando, setEliminando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  // Confirmation modal state (T071: ConfirmacionAccionSensibleModal)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  /**
   * Mostrar confirmación modal (T071: ConfirmacionAccionSensibleModal).
   */
  const handleMostrarConfirmacion = () => {
    setMostrarConfirmacion(true)
  }

  /**
   * Confirmar y ejecutar eliminación de carpeta (AC-07.1, T071).
   */
  const handleConfirmarEliminacion = async () => {
    // Limpiar errores previos
    setErrorServidor('')

    // Enviar al backend
    setEliminando(true)
    try {
      await carpetaService.eliminarCarpeta(carpeta.id)

      // AC-07.4: Notificar éxito (carpeta se elimina de la lista)
      setMostrarConfirmacion(false)
      onSuccess()
    } catch (error) {
      // Manejar errores del servidor
      const mensajeError = (error as any)?.message || 'Error al eliminar la carpeta'

      // AC-07.6: No es propietario (403)
      if (mensajeError.includes('No tienes permisos')) {
        setErrorServidor('No tienes permisos para eliminar esta carpeta.')
      }
      // Otros errores
      else {
        setErrorServidor(mensajeError)
      }

      // Mantener modal cerrada para reintentar
      setMostrarConfirmacion(false)
    } finally {
      setEliminando(false)
    }
  }

  /**
   * Manejar cancelación.
   */
  const handleCancelar = () => {
    // Limpiar estado
    setErrorServidor('')
    onCancel()
  }

  /**
   * Determinar si el botón de eliminar debe estar deshabilitado.
   */
  const eliminarDeshabilitado = eliminando || deshabilitado

  return (
    <div className="confirm-delete-carpeta-dialog">
      <div className="dialog-overlay" onClick={handleCancelar}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dialog-header">
            <h2>Eliminar carpeta</h2>
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
            {/* Error del servidor (AC-07.6, otros) */}
            {errorServidor && (
              <div className="alert alert-error">
                <p>{errorServidor}</p>
              </div>
            )}

            {/* Nombre de la carpeta a eliminar */}
            <div className="carpeta-info">
              <p>
                Vas a eliminar la carpeta: <strong>{carpeta.nombre}</strong>
              </p>
            </div>

            {/* AC-07.2: Advertencia de pérdida de contenido guardado */}
            <div className="warning-section">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h3>¿Estás seguro?</h3>

                {/* AC-07.2: Advierte que el contenido guardado se perderá */}
                <p className="warning-text">
                  <strong>El contenido guardado en esta carpeta se perderá.</strong>
                </p>

                {/* AC-07.3: Aclara que posts originales NO se eliminan */}
                <p className="info-text">
                  Las publicaciones originales <strong>no se eliminarán</strong> de la plataforma.
                  Solo se elimina tu carpeta de guardados.
                </p>

                {/* AC-07.5: Información sobre liberación de cupo */}
                <p className="info-text secondary">
                  Al eliminar esta carpeta, liberarás cupo para crear nuevas carpetas.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dialog-footer">
            <button
              className="btn btn-secondary"
              onClick={handleCancelar}
              disabled={eliminando}
            >
              Cancelar
            </button>
            {/* AC-07.7: Botón destructivo con diferenciación visual */}
            <button
              className="btn btn-danger"
              onClick={handleMostrarConfirmacion}
              disabled={eliminarDeshabilitado}
            >
              {eliminando ? 'Eliminando...' : 'Eliminar carpeta'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .confirm-delete-carpeta-dialog {
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
          max-width: 450px;
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
          border-bottom: 2px solid var(--trama-error-surface);
          background-color: var(--trama-error-surface);
        }

        .dialog-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--trama-error);
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
          padding: 24px;
        }

        .carpeta-info {
          padding: 12px;
          background-color: var(--trama-subtle);
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .carpeta-info p {
          margin: 0;
          color: var(--trama-ink);
        }

        .carpeta-info strong {
          color: var(--trama-error);
          word-break: break-word;
        }

        .warning-section {
          display: flex;
          gap: 16px;
          padding: 16px;
          background-color: var(--trama-error-surface);
          border: 1px solid var(--trama-error);
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .warning-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .warning-content {
          flex: 1;
        }

        .warning-content h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--trama-error);
        }

        .warning-text {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: var(--trama-error);
          line-height: 1.5;
        }

        .info-text {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: var(--trama-muted);
          line-height: 1.5;
        }

        .info-text.secondary {
          color: var(--trama-muted);
          font-style: italic;
          margin-bottom: 0;
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
          background-color: var(--trama-subtle);
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

        .btn-secondary {
          background-color: var(--trama-muted);
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: var(--trama-ink);
        }

        /* AC-07.7: Diferenciación visual del botón destructivo */
        .btn-danger {
          background-color: var(--trama-error);
          color: white;
          border: 2px solid var(--trama-error);
        }

        .btn-danger:hover:not(:disabled) {
          background-color: var(--trama-error);
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        }

        .btn-danger:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>

      {/* T071: Modal de confirmación de eliminación (ConfirmacionAccionSensibleModal) */}
      {/* AC-07.2, AC-07.3, A7: Mantiene advertencia completa sobre pérdida de guardados */}
      <ConfirmacionAccionSensibleModal
        abierto={mostrarConfirmacion}
        titulo="¿Eliminar esta carpeta?"
        mensaje={`Se eliminarán todos los posts guardados en "${carpeta.nombre}",\npero los posts originales seguirán en la plataforma.`}
        variante="peligro"
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
        confirmando={eliminando}
        onConfirmar={handleConfirmarEliminacion}
        onCancelar={() => {
          setMostrarConfirmacion(false)
        }}
      />
    </div>
  )
}

export default ConfirmDeleteCarpetaDialog

