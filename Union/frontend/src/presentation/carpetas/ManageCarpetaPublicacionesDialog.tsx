import React, { useState, useEffect } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { carpetaService } from '../../services/carpetaPerfilService'

/**
 * `ManageCarpetaPublicacionesDialog`: Diálogo para gestionar publicaciones dentro de una carpeta.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-10, AC-10.1–AC-10.3)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T056)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (CarpetaPost, PublicacionPerfil)
 *
 * Responsabilidades:
 * 1. Mostrar publicaciones guardadas en una carpeta (HU-10):
 *    - Listar todos los posts de la carpeta
 *    - Mostrar imagen y resumen de texto
 *    - Permitir quitar cada post sin eliminar la publicación original
 *
 * 2. Quitar publicación de carpeta (HU-10, AC-10.1–AC-10.3):
 *    - AC-10.1: Quitar NO elimina el post de la plataforma
 *    - AC-10.2: Tras quitar, la cantidad de posts de carpeta se actualiza
 *    - AC-10.3: Acción solo disponible en carpetas propias
 *    - Botón "Quitar" por publicación con confirmación
 *    - Manejo de errores (403 no propia, 404 no existe)
 *
 * 3. Integración con servicios:
 *    - publicacionService: listarPublicaciones, quitarPublicacionDeCarpeta
 *    - Callback onQuitar: notifica cambios a padre
 *    - Callback onCancel: cierra el diálogo
 *
 * Props:
 * - `carpeta: CarpetaPost` — Carpeta a gestionar
 * - `onQuitar?: (carpeta: CarpetaPost, publicacionId: string) => void` — Callback tras quitar
 * - `onCancel: () => void` — Callback de cierre
 * - `deshabilitado?: boolean` — Opcional, deshabilitar si no propietario
 *
 * Historias de usuario:
 * - HU-10: Quitar un post de una carpeta
 *
 * Criterios de aceptación:
 * - AC-10.1: Quitar NO elimina el post (solo lo desvincula de la carpeta)
 * - AC-10.2: Tras quitar, postCount se actualiza (notificado al padre)
 * - AC-10.3: Solo disponible en carpetas propias (backend valida con 403)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo diálogo (Principio VI)
 * - Si falla servidor: mostrar error específico (403 no propia, 404 no existe/no está en carpeta)
 * - T056: Integración con CarpetaList
 */

export interface ManageCarpetaPublicacionesDialogProps {
  carpeta: CarpetaPost
  onQuitar?: (carpeta: CarpetaPost, publicacionId: string) => void
  onCancel: () => void
  deshabilitado?: boolean
}

export const ManageCarpetaPublicacionesDialog: React.FC<ManageCarpetaPublicacionesDialogProps> = ({
  carpeta,
  onQuitar,
  onCancel,
  deshabilitado = false,
}) => {
  // State para publicaciones
  const [publicaciones, setPublicaciones] = useState<PublicacionPerfil[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string>('')
  const [totalPublicaciones, setTotalPublicaciones] = useState(0)
  const [cargandoMas, setCargandoMas] = useState(false)

  // State para quitar
  const [quitando, setQuitando] = useState<string | null>(null)
  const [errorServidor, setErrorServidor] = useState<string>('')

  /**
   * Cargar publicaciones de la carpeta al abrir el diálogo (AC-10.1–AC-10.3).
   */
  useEffect(() => {
    let activo = true
    setCargando(true)
    setErrorCarga('')
    setPublicaciones([])
    setTotalPublicaciones(0)
    void carpetaService
      .listarPostsDeCarpeta(carpeta.id, 20, 0)
      .then((resultado) => {
        if (activo) {
          setPublicaciones(resultado.publicaciones)
          setTotalPublicaciones(resultado.total)
        }
      })
      .catch((error: unknown) => {
        if (activo) {
          setErrorCarga(
            error instanceof Error
              ? error.message
              : 'Error al cargar las publicaciones.',
          )
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [carpeta.id])

  const handleCargarMas = async () => {
    if (cargandoMas || publicaciones.length >= totalPublicaciones) {
      return
    }
    setCargandoMas(true)
    setErrorCarga('')
    try {
      const resultado = await carpetaService.listarPostsDeCarpeta(
        carpeta.id,
        20,
        publicaciones.length,
      )
      setPublicaciones((actuales) => [...actuales, ...resultado.publicaciones])
      setTotalPublicaciones(resultado.total)
    } catch (error) {
      setErrorCarga(
        error instanceof Error ? error.message : 'Error al cargar las publicaciones.',
      )
    } finally {
      setCargandoMas(false)
    }
  }

  /**
   * Quitar publicación de la carpeta (AC-10.1–AC-10.3).
   */
  const handleQuitar = async (publicacionId: string) => {
    setQuitando(publicacionId)
    setErrorServidor('')

    try {
      // Invocar servicio (T048/T049)
      await carpetaService.quitarPostDeCarpeta(carpeta.id, publicacionId)

      // AC-10.2: Actualizar lista local removiendo la publicación
      setPublicaciones((prev) => prev.filter((p) => p.id !== publicacionId))
      setTotalPublicaciones((total) => Math.max(0, total - 1))

      // Notificar al padre (AC-10.2: postCount se actualiza)
      if (onQuitar) {
        onQuitar(carpeta, publicacionId)
      }
    } catch (error) {
      // Manejar errores del servidor
      const mensajeError = (error as any)?.message || 'Error al quitar la publicación.'

      // AC-10.3: No es propia (403)
      if (mensajeError.includes('No tienes permisos')) {
        setErrorServidor('No tienes permisos para quitar publicaciones de esta carpeta.')
      }
      // Publicación o carpeta no existe
      else if (mensajeError.includes('no existe')) {
        setErrorServidor('La carpeta o publicación no existe.')
      }
      // Otros errores
      else {
        setErrorServidor(mensajeError)
      }
    } finally {
      setQuitando(null)
    }
  }

  /**
   * Manejar cancelación.
   */
  const handleCancelar = () => {
    onCancel()
  }

  return (
    <div style={styles.overlay} onClick={handleCancelar}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.titulo}>
            Publicaciones en "{carpeta.nombre}"
          </h2>
          <button
            onClick={handleCancelar}
            style={styles.closeButton}
            aria-label="Cerrar diálogo"
            disabled={quitando !== null}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Error de carga */}
          {errorCarga && (
            <div style={styles.alertError}>
              <p>{errorCarga}</p>
            </div>
          )}

          {/* Error de servidor (AC-10.3) */}
          {errorServidor && (
            <div style={styles.alertError}>
              <p>{errorServidor}</p>
            </div>
          )}

          {/* Cargando */}
          {cargando && (
            <div style={styles.cargando}>
              <p>Cargando publicaciones...</p>
            </div>
          )}

          {/* Sin publicaciones */}
          {!cargando && publicaciones.length === 0 && !errorCarga && (
            <div style={styles.vacio}>
              <p>No hay publicaciones en esta carpeta.</p>
            </div>
          )}

          {/* Lista de publicaciones (AC-10.1–AC-10.3) */}
          {!cargando && publicaciones.length > 0 && (
            <div style={styles.publicacionesList}>
              {publicaciones.map((pub) => (
                <div key={pub.id} style={styles.publicacionItem}>
                  {/* Imagen */}
                  <div style={styles.imagenContainer}>
                    <img
                      src={pub.imagenUrl}
                      alt="Publicación"
                      style={styles.imagen}
                    />
                  </div>

                  {/* Contenido */}
                  <div style={styles.contenido}>
                    {/* Texto preview */}
                    <p style={styles.texto}>
                      {pub.texto.substring(0, 100)}
                      {pub.texto.length > 100 ? '...' : ''}
                    </p>

                    {/* Fecha */}
                    <p style={styles.fecha}>
                      {pub.fechaCreacion instanceof Date
                        ? pub.fechaCreacion.toLocaleDateString()
                        : new Date(pub.fechaCreacion).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Botón Quitar — AC-10.1–AC-10.3 */}
                  <button
                    onClick={() => handleQuitar(pub.id)}
                    disabled={quitando !== null || deshabilitado}
                    style={{
                      ...styles.btnQuitar,
                      opacity: quitando === pub.id ? 0.6 : 1,
                      cursor: quitando !== null ? 'not-allowed' : 'pointer',
                    }}
                    title={quitando === pub.id ? 'Quitando...' : 'Quitar de la carpeta'}
                  >
                    {quitando === pub.id ? 'Quitando...' : 'Quitar'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {!cargando && publicaciones.length < totalPublicaciones && (
            <button
              type="button"
              onClick={() => void handleCargarMas()}
              disabled={cargandoMas}
              style={styles.btnCancelar}
            >
              {cargandoMas ? 'Cargando...' : 'Cargar más'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleCancelar}
            disabled={quitando !== null}
            style={{
              ...styles.btnCancelar,
              opacity: quitando !== null ? 0.6 : 1,
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Estilos inline para el diálogo (T056).
 */
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    maxWidth: '700px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  titulo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  body: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
  },
  alertError: {
    padding: '12px',
    backgroundColor: 'var(--color-error-surface)',
    border: '1px solid var(--color-error)',
    borderRadius: '4px',
    color: 'var(--color-error)',
    fontSize: '14px',
    marginBottom: '1rem',
  },
  cargando: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '2rem',
  },
  vacio: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    padding: '2rem',
  },
  publicacionesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  publicacionItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--color-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    alignItems: 'center',
  },
  imagenContainer: {
    flexShrink: 0,
    width: '80px',
    height: '80px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: 'var(--color-border)',
  },
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  contenido: {
    flex: 1,
    minWidth: 0,
  },
  texto: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--color-text)',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  fecha: {
    margin: '0.5rem 0 0 0',
    fontSize: '14px',
    color: '#9ca3af',
  },
  btnQuitar: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  btnCancelar: {
    padding: '0.5rem 1rem',
    fontSize: '14px',
    backgroundColor: 'var(--color-subtle)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-control)',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
}
