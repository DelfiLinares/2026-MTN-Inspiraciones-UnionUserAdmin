import React, { useState } from 'react'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { publicacionService } from '../../services/perfilPublicacionService'
import { ConfirmacionAccionSensibleModal } from '../shared'

/**
 * `ConfirmDeletePostDialog`: Diálogo de confirmación de eliminación de publicación.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-12, AC-12.1–AC-12.4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", publicaciones/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T051, T073)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (PublicacionPerfil entity)
 *
 * Responsabilidades:
 * 1. Confirmación explícita de eliminación (HU-12, AC-12.2):
 *    - Requiere confirmación explícita antes de eliminar
 *    - Implementado con ConfirmacionAccionSensibleModal (T073)
 *
 * 2. Advertencias claras (AC-12.2, AC-12.3):
 *    - AC-12.2: Requiere confirmación explícita
 *    - AC-12.3: Aclara que la publicación desaparece del perfil
 *    - Acción destructiva e irreversible
 *
 * 3. Diferenciación visual (AC-12.4):
 *    - ConfirmacionAccionSensibleModal con variante='peligro'
 *    - Distinto de acciones de consulta (editar, guardar en carpeta)
 *    - Colores de advertencia y icono distintivo
 *
 * 4. Integración con servicios (PublicacionService, T048/T049):
 *    - Invoca publicacionService.eliminarPublicacion(publicacionId)
 *    - Callback onSuccess: () => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `publicacion: PublicacionPerfil` — Publicación a eliminar
 * - `onSuccess: () => void` — Callback tras eliminar
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no propietario
 *
 * Historias de usuario:
 * - HU-12: Eliminar publicación propia
 *
 * Criterios de aceptación:
 * - AC-12.1: Solo disponible para publicaciones propias (backend: 403)
 * - AC-12.2: Requiere confirmación explícita (ConfirmacionAccionSensibleModal)
 * - AC-12.3: Tras eliminar, la publicación desaparece del perfil (callback notifica)
 * - AC-12.4: La acción se diferencia visualmente (variante='peligro')
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - Acción destructiva: requiere confirmación explícita y diferenciación visual
 * - Si falla servidor: mostrar error específico (AC-12.1: 403 no propietario, 404 no existe)
 * - T054: Integración con PublicacionList
 * - T073: ConfirmacionAccionSensibleModal con variante='peligro'
 */

export interface ConfirmDeletePostDialogProps {
  publicacion: PublicacionPerfil
  onSuccess: () => void
  onCancel: () => void
  deshabilitado?: boolean
}

export const ConfirmDeletePostDialog: React.FC<ConfirmDeletePostDialogProps> = ({
  publicacion,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Server state
  const [eliminando, setEliminando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  // T073: Confirmation modal state
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)

  /**
   * T073: Mostrar modal de confirmación (no ejecutar eliminación aún).
   */
  const handleMostrarConfirmacion = () => {
    setMostrarConfirmacion(true)
  }

  /**
   * T073: Confirmar y ejecutar eliminación (AC-12.2: confirmación explícita).
   */
  const handleConfirmarEliminacion = async () => {
    // Limpiar errores previos
    setErrorServidor('')

    // Enviar al backend
    setEliminando(true)
    try {
      await publicacionService.eliminarPublicacion(publicacion.id)

      // AC-12.3: Notificar éxito (publicación se elimina de la lista)
      setMostrarConfirmacion(false)
      onSuccess()
    } catch (error) {
      // Manejar errores del servidor
      const mensajeError = (error as any)?.message || 'Error al eliminar la publicación'

      // AC-12.1: No es propietario (403)
      if (mensajeError.includes('No tienes permisos')) {
        setErrorServidor('No tienes permisos para eliminar esta publicación.')
      }
      // Publicación no existe
      else if (mensajeError.includes('no existe')) {
        setErrorServidor('La publicación no existe o ya ha sido eliminada.')
      }
      // Otros errores
      else {
        setErrorServidor(mensajeError)
      }
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
    <div className="confirm-delete-post-dialog">
      <div className="dialog-overlay" onClick={handleCancelar}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dialog-header">
            <h2>Eliminar publicación</h2>
            <button
              className="close-button"
              onClick={handleCancelar}
              aria-label="Cerrar diálogo"
              disabled={eliminando}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="dialog-body">
            {/* Error del servidor (AC-12.1, otros) */}
            {errorServidor && (
              <div className="alert alert-error">
                <p>{errorServidor}</p>
              </div>
            )}

            {/* Vista previa de la publicación */}
            <div className="post-preview">
              <div className="post-preview-image">
                <img
                  src={publicacion.imagenUrl}
                  alt="Publicación a eliminar"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 'var(--trama-radius)',
                    maxHeight: '150px',
                  }}
                />
              </div>
              <div className="post-preview-text">
                <p className="post-text-label">Contenido:</p>
                <p className="post-text-preview">
                  {publicacion.texto.substring(0, 100)}
                  {publicacion.texto.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>

            {/* AC-12.2: Advertencia clara de eliminación */}
            <div className="warning-section">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <h3>¿Estás seguro?</h3>

                {/* AC-12.3: Acción destructiva e irreversible */}
                <p className="warning-text">
                  <strong>Esta acción es irreversible.</strong> La publicación se eliminará
                  permanentemente de tu perfil y no podrá recuperarse.
                </p>

                {/* Información adicional */}
                <p className="info-text">
                  Se eliminará de todas las carpetas donde la hayas guardado.
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
            {/* AC-12.4: Botón destructivo con diferenciación visual */}
            <button
              className="btn btn-danger"
              onClick={handleMostrarConfirmacion}
              disabled={eliminarDeshabilitado}
            >
              {eliminando ? 'Eliminando...' : 'Eliminar publicación'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .confirm-delete-post-dialog {
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
          max-width: 500px;
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

        .close-button:hover:not(:disabled) {
          background-color: var(--trama-subtle);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dialog-body {
          padding: 24px;
        }

        .post-preview {
          display: flex;
          gap: 16px;
          padding: 12px;
          background-color: var(--trama-subtle);
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid var(--trama-line);
        }

        .post-preview-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          background-color: var(--trama-subtle);
        }

        .post-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-preview-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .post-text-label {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--trama-muted);
          text-transform: uppercase;
        }

        .post-text-preview {
          margin: 0;
          font-size: 14px;
          color: var(--trama-ink);
          line-height: 1.4;
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
          margin: 0;
          font-size: 14px;
          color: var(--trama-muted);
          line-height: 1.5;
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

        /* AC-12.4: Diferenciación visual del botón destructivo */
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

      {/* T073: Modal de confirmación de eliminación (ConfirmacionAccionSensibleModal) */}
      {/* AC-12.2, AC-12.4: Confirmación explícita con diferenciación visual (peligro) */}
      <ConfirmacionAccionSensibleModal
        abierto={mostrarConfirmacion}
        titulo="¿Eliminar esta publicación?"
        mensaje="Una vez eliminada, no podrás recuperar esta publicación."
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

export default ConfirmDeletePostDialog

