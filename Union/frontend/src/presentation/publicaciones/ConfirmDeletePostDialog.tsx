import React, { useState } from 'react'
import { Publicacion } from '../../domain/Publicacion'
import { publicacionService } from '../../services/perfilPublicacionService'

/**
 * `ConfirmDeletePostDialog`: Diálogo de confirmación de eliminación de publicación.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-12, AC-12.1–AC-12.4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", publicaciones/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T051)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Publicacion entity)
 *
 * Responsabilidades:
 * 1. Confirmación explícita de eliminación (HU-12, AC-12.2):
 *    - Requiere confirmación explícita antes de eliminar
 *    - Implementado en UI: botones "Cancelar" y "Eliminar publicación"
 *
 * 2. Advertencias claras (AC-12.2, AC-12.3):
 *    - AC-12.2: Requiere confirmación explícita
 *    - AC-12.3: Aclara que la publicación desaparece del perfil
 *    - Acción destructiva e irreversible
 *
 * 3. Diferenciación visual (AC-12.4):
 *    - Botón "Eliminar publicación" con color rojo/destructivo
 *    - Distinto de acciones de consulta (editar, guardar en carpeta)
 *    - Header con fondo rojo para enfatizar la acción destructiva
 *
 * 4. Integración con servicios (PublicacionService, T048/T049):
 *    - Invoca publicacionService.eliminarPublicacion(publicacionId)
 *    - Callback onSuccess: () => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `publicacion: Publicacion` — Publicación a eliminar
 * - `onSuccess: () => void` — Callback tras eliminar
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no propietario
 *
 * Historias de usuario:
 * - HU-12: Eliminar publicación propia
 *
 * Criterios de aceptación:
 * - AC-12.1: Solo disponible para publicaciones propias (backend: 403)
 * - AC-12.2: Requiere confirmación explícita (implementada en UI)
 * - AC-12.3: Tras eliminar, la publicación desaparece del perfil (callback notifica)
 * - AC-12.4: La acción se diferencia visualmente (botón rojo, header destructivo)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - Acción destructiva: requiere confirmación explícita y diferenciación visual
 * - Si falla servidor: mostrar error específico (AC-12.1: 403 no propietario, 404 no existe)
 * - T054: Integración con PublicacionList
 */

export interface ConfirmDeletePostDialogProps {
  publicacion: Publicacion
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

  /**
   * Manejar eliminación de publicación (AC-12.2: confirmación explícita).
   */
  const handleEliminar = async () => {
    // Limpiar errores previos
    setErrorServidor('')

    // Enviar al backend
    setEliminando(true)
    try {
      await publicacionService.eliminarPublicacion(publicacion.id)

      // AC-12.3: Notificar éxito (publicación se elimina de la lista)
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
                    borderRadius: '4px',
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
              onClick={handleEliminar}
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
          border-bottom: 2px solid #fee;
          background-color: #fff8f8;
        }

        .dialog-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #c0392b;
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

        .close-button:hover:not(:disabled) {
          background-color: #f5f5f5;
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
          background-color: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #e0e0e0;
        }

        .post-preview-image {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          background-color: #e9ecef;
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
          font-size: 12px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
        }

        .post-text-preview {
          margin: 0;
          font-size: 13px;
          color: #333;
          line-height: 1.4;
          word-break: break-word;
        }

        .warning-section {
          display: flex;
          gap: 16px;
          padding: 16px;
          background-color: #fff8f8;
          border: 1px solid #f5c6cb;
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
          color: #c0392b;
        }

        .warning-text {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #721c24;
          line-height: 1.5;
        }

        .info-text {
          margin: 0;
          font-size: 13px;
          color: #555;
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
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }

        .dialog-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          background-color: #f9f9f9;
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
          background-color: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #7f8c8d;
        }

        /* AC-12.4: Diferenciación visual del botón destructivo */
        .btn-danger {
          background-color: #e74c3c;
          color: white;
          border: 2px solid #c0392b;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        }

        .btn-danger:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  )
}

export default ConfirmDeletePostDialog
