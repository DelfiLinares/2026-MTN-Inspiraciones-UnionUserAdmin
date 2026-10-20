import React, { useState, useEffect } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { carpetaService } from '../../services/carpetaPerfilService'
import type { ResultadoGuardadoPublicacion } from '../../application/ports/PublicacionRepository'
import { publicacionService } from '../../services/perfilPublicacionService'
import { CreateCarpetaDialog } from '../carpetas/CreateCarpetaDialog'

/**
 * `SavePostToCarpetaDialog`: Diálogo para guardar una publicación en una carpeta.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, AC-09.1–AC-09.5, A8)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", publicaciones/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T052)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (CarpetaPost, PublicacionPerfil)
 *
 * Responsabilidades:
 * 1. Flujo de guardado de publicación (HU-09):
 *    - AC-09.1: Seleccionar carpeta existente
 *    - AC-09.2: Crear carpeta nueva en el mismo flujo
 *    - AC-09.3: Aplicar mismas reglas que HU-05
 *    - AC-09.4: Reflejar guardado exitoso en UI
 *    - AC-09.5: Mostrar error y no marcar como guardado si falla
 *
 * 2. Gestión de carpetas:
 *    - Listar carpetas propias (listarCarpetas)
 *    - Crear nueva carpeta inline (CreateCarpetaDialog integrado)
 *    - A8: Manejo de idempotencia (guardar post ya guardado en misma carpeta)
 *
 * 3. Integración con servicios:
 *    - carpetaService: listarCarpetas, crearCarpeta
 *    - publicacionService: guardarPublicacionEnCarpeta
 *    - Callback onSuccess: (resultado: ResultadoGuardadoPublicacion) => void
 *    - Callback onCancel: () => void
 *
 * Props:
 * - `publicacion: PublicacionPerfil` — Publicación a guardar
 * - `usuarioId: string` — ID del usuario propietario de carpetas
 * - `onSuccess: (resultado) => void` — Callback tras guardar exitosamente
 * - `onCancel: () => void` — Callback de cancelación
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no autenticado
 *
 * Historias de usuario:
 * - HU-09: Guardar publicación en carpeta
 *
 * Criterios de aceptación:
 * - AC-09.1: Permitir seleccionar carpeta existente
 * - AC-09.2: Permitir crear carpeta nueva sin salir del flujo
 * - AC-09.3: Aplicar reglas de HU-05 (nombre 1–15 chars, max 50 carpetas)
 * - AC-09.4: Tras guardar, reflejar éxito en UI (callback onSuccess)
 * - AC-09.5: Si error, mostrar mensaje y no marcar como guardado
 *
 * Clarificaciones:
 * - A8: Guardar es idempotente (200 si existe, 201 si nueva); mostrar mensaje apropiado
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - CreateCarpetaDialog integrado inline permite crear sin salir (AC-09.2)
 * - A8: Mostrar mensaje diferenciado si post ya estaba guardado (200 idempotente)
 * - Si falla servidor: mostrar error específico (403 carpeta no propia, 404 no existe, 507 límite)
 * - T055: Integración con PublicacionList
 */

export interface SavePostToCarpetaDialogProps {
  publicacion: PublicacionPerfil
  usuarioId: string
  onSuccess: (resultado: ResultadoGuardadoPublicacion) => void
  onCancel: () => void
  deshabilitado?: boolean
}

export const SavePostToCarpetaDialog: React.FC<SavePostToCarpetaDialogProps> = ({
  publicacion,
  usuarioId,
  onSuccess,
  onCancel,
  deshabilitado = false,
}) => {
  // Carpeta selection state (AC-09.1)
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string | null>(null)

  // Carpeta list state
  const [carpetas, setCarpetas] = useState<CarpetaPost[]>([])
  const [cargandoCarpetas, setCargandoCarpetas] = useState(true)

  // Create carpeta dialog state (AC-09.2)
  const [mostrarCrearCarpeta, setMostrarCrearCarpeta] = useState(false)

  // Server state
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string>('')

  /**
   * Cargar lista de carpetas al abrir (AC-09.1).
   */
  useEffect(() => {
    const cargarCarpetas = async () => {
      setCargandoCarpetas(true)
      try {
        const resultado = await carpetaService.listarCarpetas(usuarioId, 50, 0)
        setCarpetas(resultado.carpetas)
        // Pre-seleccionar la primera carpeta si hay alguna
        if (resultado.carpetas.length > 0) {
          setCarpetaSeleccionada(resultado.carpetas[0].id)
        }
      } catch (error) {
        const mensaje = (error as Error)?.message || 'Error al cargar carpetas.'
        setErrorServidor(mensaje)
      } finally {
        setCargandoCarpetas(false)
      }
    }

    cargarCarpetas()
  }, [usuarioId])

  /**
   * Manejar creación de carpeta nueva (AC-09.2: crear sin salir del diálogo).
   */
  const handleCarpetaCreada = (carpeta: CarpetaPost) => {
    // Agregar nueva carpeta a la lista
    setCarpetas([...carpetas, carpeta])

    // Pre-seleccionar la carpeta recién creada
    setCarpetaSeleccionada(carpeta.id)

    // Cerrar diálogo de creación
    setMostrarCrearCarpeta(false)

    // Limpiar errores
    setErrorServidor('')
  }

  /**
   * Manejar selección de carpeta (AC-09.1).
   */
  const handleSeleccionarCarpeta = (carpetaId: string) => {
    setCarpetaSeleccionada(carpetaId)
    setErrorServidor('')
  }

  /**
   * Manejar guardado de publicación en carpeta (AC-09.1, AC-09.4).
   */
  const handleGuardar = async () => {
    if (!carpetaSeleccionada) {
      setErrorServidor('Debes seleccionar una carpeta.')
      return
    }

    setGuardando(true)
    setErrorServidor('')

    try {
      // Invocar servicio (T048/T049)
      const resultado = await publicacionService.guardarPublicacionEnCarpeta(
        carpetaSeleccionada,
        publicacion.id,
      )

      // AC-09.4: Reflejar guardado exitoso
      // A8: Diferenciar entre 201 (nueva) y 200 (idempotente)
      if (resultado.esNueva) {
        // 201: Guardado por primera vez
        onSuccess({
          ...resultado,
          mensaje: `Publicación guardada en la carpeta ${carpetas.find((c) => c.id === carpetaSeleccionada)?.nombre || 'seleccionada'}.`,
        })
      } else {
        // 200: A8 - Idempotente, ya estaba guardada
        onSuccess({
          ...resultado,
          mensaje: `Esta publicación ya estaba guardada en la carpeta ${carpetas.find((c) => c.id === carpetaSeleccionada)?.nombre || 'seleccionada'}.`,
        })
      }
    } catch (error) {
      // AC-09.5: Mostrar error sin marcar como guardado
      const mensajeError = (error as Error)?.message || 'Error al guardar la publicación.'

      if (mensajeError.includes('No tienes permisos')) {
        setErrorServidor('No tienes permisos para guardar en esta carpeta.')
      } else if (mensajeError.includes('no existe')) {
        setErrorServidor('La carpeta o publicación no existe.')
      } else if (mensajeError.includes('límite')) {
        setErrorServidor('Se alcanzó el límite de publicaciones en esta carpeta.')
      } else {
        setErrorServidor(mensajeError)
      }
    } finally {
      setGuardando(false)
    }
  }

  /**
   * Manejar cancelación.
   */
  const handleCancelar = () => {
    setErrorServidor('')
    onCancel()
  }

  /**
   * Determinar si el botón de guardar debe estar deshabilitado.
   */
  const guardarDeshabilitado = guardando || deshabilitado || !carpetaSeleccionada || cargandoCarpetas

  return (
    <div className="save-post-to-carpeta-dialog">
      <div className="dialog-overlay" onClick={handleCancelar}>
        <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="dialog-header">
            <h2>Guardar en carpeta</h2>
            <button
              className="close-button"
              onClick={handleCancelar}
              aria-label="Cerrar diálogo"
              disabled={guardando}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="dialog-body">
            {/* Error del servidor (AC-09.5) */}
            {errorServidor && (
              <div className="alert alert-error">
                <p>{errorServidor}</p>
              </div>
            )}

            {/* AC-09.1: Lista de carpetas existentes */}
            <div className="carpetas-section">
              <label className="section-label">Tus carpetas</label>

              {cargandoCarpetas ? (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  Cargando carpetas...
                </p>
              ) : carpetas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
                  No tienes carpetas creadas.
                </p>
              ) : (
                <div className="carpetas-list">
                  {carpetas.map((carpeta) => (
                    <label key={carpeta.id} className="carpeta-item">
                      <input
                        type="radio"
                        name="carpeta"
                        value={carpeta.id}
                        checked={carpetaSeleccionada === carpeta.id}
                        onChange={() => handleSeleccionarCarpeta(carpeta.id)}
                        disabled={guardando}
                      />
                      <span className="carpeta-name">{carpeta.nombre}</span>
                      <span className="carpeta-count">({carpeta.postCount || 0} posts)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* AC-09.2: Botón para crear carpeta nueva en el flujo */}
            <div className="crear-carpeta-section">
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setMostrarCrearCarpeta(true)}
                disabled={guardando || deshabilitado}
                style={{ width: '100%' }}
              >
                + Crear nueva carpeta
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="dialog-footer">
            <button
              className="btn btn-secondary"
              onClick={handleCancelar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGuardar}
              disabled={guardarDeshabilitado}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          {/* AC-09.2: CreateCarpetaDialog integrado inline */}
          {mostrarCrearCarpeta && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <CreateCarpetaDialog
                carpetasActuales={carpetas}
                onSuccess={handleCarpetaCreada}
                onCancel={() => setMostrarCrearCarpeta(false)}
                deshabilitado={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        .save-post-to-carpeta-dialog {
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
          position: relative;
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
          background-color: #f9f9f9;
        }

        .dialog-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
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
          background-color: #e9ecef;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dialog-body {
          padding: 24px;
          max-height: 400px;
          overflow-y: auto;
        }

        .section-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .carpetas-section {
          margin-bottom: 20px;
        }

        .carpetas-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .carpeta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .carpeta-item:hover {
          background-color: #f0f0f0;
          border-color: #6b7280;
        }

        .carpeta-item input[type="radio"] {
          cursor: pointer;
          margin: 0;
        }

        .carpeta-name {
          flex: 1;
          color: #333;
          font-weight: 500;
        }

        .carpeta-count {
          color: #999;
          font-size: 12px;
        }

        .crear-carpeta-section {
          margin-bottom: 10px;
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

        .btn-primary {
          background-color: #4b5563;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #374151;
        }

        .btn-small {
          padding: 8px 12px;
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}

export default SavePostToCarpetaDialog
