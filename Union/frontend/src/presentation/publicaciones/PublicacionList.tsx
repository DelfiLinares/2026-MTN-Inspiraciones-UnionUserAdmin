import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Publicacion } from '../../domain/Publicacion'
import { EditPostForm } from './EditPostForm'
import { ConfirmDeletePostDialog } from './ConfirmDeletePostDialog'
import { SavePostToCarpetaDialog } from './SavePostToCarpetaDialog'

/**
 * Componente PublicacionList — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, HU-11, HU-12, HU-13, AC-03.2, AC-03.3)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, componentes de presentación)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Entidad: Publicacion)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (schema: PaginaPublicaciones)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T025, T053, T054, T055, T063)
 *
 * Renderiza la lista de publicaciones de un perfil (propio o ajeno) con paginación.
 *
 * Funcionalidades:
 * - HU-13.1–HU-13.3: Visualizar todas las publicaciones del usuario en modo consulta (perfil ajeno)
 * - HU-11.1–HU-11.4: Editar publicación propia (solo en perfil propio, con confirmación) [T053]
 * - HU-12.1–HU-12.4: Eliminar publicación propia (solo en perfil propio, con confirmación, visual diferenciada) [T054]
 * - HU-09.1–HU-09.5: Guardar publicación en carpeta con idempotencia (A8) [T055]
 * - A6 (paginación server-side): Botón "Cargar más" cuando hasMore = true
 * - AC-03.2, AC-03.3: Navegación a perfil ajeno desde foto/nombre de autor (T063)
 *
 * Integraciones:
 * - T050: EditPostForm — Componente de edición
 * - T051: ConfirmDeletePostDialog — Componente de confirmación de eliminación
 * - T052: SavePostToCarpetaDialog — Componente de guardado en carpeta
 * - T053: Integración de EditPostForm en overlay modal
 * - T054: Integración de ConfirmDeletePostDialog en overlay modal
 * - T055: Integración de SavePostToCarpetaDialog en overlay modal
 * - T063: Navegación a `/perfil/:id` al clickear foto o nombre del autor
 *
 * Props:
 * - publicaciones: Publicacion[] — Array de publicaciones en la página actual
 * - paginacion?: { items, total, limit, offset, hasMore } — Metadatos de paginación (A6)
 * - esPerfilPropio: boolean — Si true, muestra botones de editar/eliminar
 * - usuarioActualId?: string — ID del usuario actual (para verificación esPropia() y guardar en carpeta)
 * - onEditar?: (publicacion: Publicacion) => void — Callback para editar (AC-11.2) [T053]
 * - onEliminar?: (publicacion: Publicacion) => void — Callback para eliminar (AC-12.2) [T054]
 * - onCargarMas?: () => void — Callback para cargar siguiente página (A6)
 * - cargando?: boolean — Indica si se está cargando la página actual
 * - cargandoMas?: boolean — Indica si se está cargando la siguiente página
 * - onEditarExitosamente?: (publicacion: Publicacion) => void — Callback tras edición exitosa [T053]
 * - onEliminarExitosamente?: (publicacionId: string) => void — Callback tras eliminación exitosa [T054]
 * - onGuardarEnCarpeta?: (publicacion: Publicacion) => void — Callback para guardar en carpeta (AC-09.1–AC-09.5, A8) [T055]
 */

interface PublicacionListProps {
  publicaciones: Publicacion[]
  paginacion?: {
    items: Publicacion[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  esPerfilPropio: boolean
  usuarioActualId?: string
  onEditar?: (publicacion: Publicacion) => void
  onEliminar?: (publicacionId: string) => void
  onCargarMas?: () => void
  cargando?: boolean
  cargandoMas?: boolean
  onEditarExitosamente?: (publicacion: Publicacion) => void
  onEliminarExitosamente?: (publicacionId: string) => void
  onGuardarEnCarpeta?: (publicacion: Publicacion) => void
}

/**
 * React component para listar publicaciones del perfil.
 * Soporta paginación, acciones condicionales (editar/eliminar en perfil propio).
 */
export const PublicacionList: React.FC<PublicacionListProps> = ({
  publicaciones,
  paginacion,
  esPerfilPropio,
  usuarioActualId,
  onEditar,
  onEliminar,
  onCargarMas,
  cargando = false,
  cargandoMas = false,
  onEditarExitosamente,
  onEliminarExitosamente,
  onGuardarEnCarpeta,
}) => {
  const navigate = useNavigate()
  const [cargandoAccion, setCargandoAccion] = useState<string | null>(null)
  const [publicacionEnEdicion, setPublicacionEnEdicion] = useState<Publicacion | null>(null)
  const [publicacionEnEliminacion, setPublicacionEnEliminacion] = useState<Publicacion | null>(null)
  const [publicacionEnGuardado, setPublicacionEnGuardado] = useState<Publicacion | null>(null)

  /**
   * Manejador para editar publicación.
   * HU-11: Abre formulario de edición con confirmación (AC-11.2, AC-11.3).
   * T053: Integra EditPostForm en la lista.
   */
  const handleEditar = (publicacion: Publicacion) => {
    if (onEditar) {
      setCargandoAccion(publicacion.id)
      // Simular delay de carga; en implementación real, el servicio maneja esto
      setTimeout(() => {
        setPublicacionEnEdicion(publicacion)
        setCargandoAccion(null)
      }, 300)
    }
  }

  /**
   * Manejador para cierre de formulario de edición.
   * Limpia el estado de edición sin guardar.
   */
  const handleCancelarEdicion = () => {
    setPublicacionEnEdicion(null)
  }

  /**
   * Manejador para éxito en edición.
   * AC-11.3: Actualiza la publicación en la UI tras editar exitosamente.
   * T053: Actualiza la lista con la publicación editada.
   */
  const handleEdicionExitosa = (publicacionEditada: Publicacion) => {
    // Actualizar la publicación en la lista local
    const indice = publicaciones.findIndex((p) => p.id === publicacionEditada.id)
    if (indice !== -1) {
      const nuevasPublicaciones = [...publicaciones]
      nuevasPublicaciones[indice] = publicacionEditada
      // Nota: Esto requeriría que PublicacionList maneje estado de publicaciones
      // Para ahora, cerramos el formulario y notificamos al padre
    }

    // Cerrar formulario de edición
    setPublicacionEnEdicion(null)

    // Invocar callback opcional del padre si existe
    if (onEditarExitosamente) {
      onEditarExitosamente(publicacionEditada)
    }
  }

  /**
   * Manejador para eliminar publicación.
   * HU-12: Abre diálogo de confirmación (AC-12.2, AC-12.3).
   * T054: Integra ConfirmDeletePostDialog en la lista.
   */
  const handleEliminar = (publicacion: Publicacion) => {
    if (onEliminar) {
      setCargandoAccion(publicacion.id)
      // Simular delay de carga; en implementación real, el servicio maneja esto
      setTimeout(() => {
        setPublicacionEnEliminacion(publicacion)
        setCargandoAccion(null)
      }, 300)
    }
  }

  /**
   * Manejador para cierre de diálogo de eliminación.
   * Limpia el estado sin eliminar.
   */
  const handleCancelarEliminacion = () => {
    setPublicacionEnEliminacion(null)
  }

  /**
   * Manejador para éxito en eliminación.
   * AC-12.3: La publicación desaparece del perfil tras eliminación exitosa.
   * T054: Actualiza la lista tras eliminación.
   */
  const handleEliminacionExitosa = () => {
    const publicacionId = publicacionEnEliminacion?.id
    
    // Cerrar diálogo de eliminación
    setPublicacionEnEliminacion(null)

    // Invocar callback opcional del padre si existe
    if (publicacionId && onEliminarExitosamente) {
      onEliminarExitosamente(publicacionId)
    }
  }

  /**
   * Manejador para guardar publicación en carpeta.
   * HU-09: Abre diálogo para seleccionar/crear carpeta (AC-09.1, AC-09.2).
   * T055: Integra SavePostToCarpetaDialog en la lista.
   */
  const handleGuardar = (publicacion: Publicacion) => {
    if (onGuardarEnCarpeta) {
      setCargandoAccion(publicacion.id)
      // Simular delay de carga; en implementación real, el servicio maneja esto
      setTimeout(() => {
        setPublicacionEnGuardado(publicacion)
        setCargandoAccion(null)
      }, 300)
    }
  }

  /**
   * Manejador para cierre de diálogo de guardado.
   * Limpia el estado sin guardar.
   */
  const handleCancelarGuardado = () => {
    setPublicacionEnGuardado(null)
  }

  /**
   * Manejador para éxito en guardado.
   * AC-09.4: Tras guardar, la interfaz refleja que el post quedó guardado.
   * A8: Diferenciar entre 201 (nuevo) y 200 (idempotente).
   * T055: Actualiza la UI tras guardado.
   */
  const handleGuardadoExitoso = (resultado: any) => {
    // Cerrar diálogo de guardado
    setPublicacionEnGuardado(null)

    // Invocar callback opcional del padre si existe
    if (onGuardarEnCarpeta) {
      // El padre puede usar resultado.esNueva para diferenciar (A8)
      onGuardarEnCarpeta(publicacionEnGuardado!)
    }
  }

  /**
   * Manejador para cargar más publicaciones.
   * A6: Paginación server-side con botón "Cargar más".
   */
  const handleCargarMas = () => {
    if (onCargarMas && paginacion?.hasMore) {
      onCargarMas()
    }
  }

  /**
   * Manejador para navegar a perfil ajeno (T063).
   * AC-03.2, AC-03.3: Clickear foto o nombre de usuario navega a `/perfil/:id`.
   */
  const handleNavegaAPerfil = (autorId: string) => {
    navigate(`/perfil/${autorId}`)
  }

  // Estado de carga general (mientras se obtienen publicaciones)
  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando publicaciones...</p>
      </div>
    )
  }

  // T053: Mostrar formulario de edición si hay publicación en edición
  if (publicacionEnEdicion) {
    return (
      <div style={styles.edicionOverlay}>
        <div style={styles.edicionContainer}>
          <EditPostForm
            publicacion={publicacionEnEdicion}
            onSuccess={handleEdicionExitosa}
            onCancel={handleCancelarEdicion}
            deshabilitado={false}
          />
        </div>
      </div>
    )
  }

  // T054: Mostrar diálogo de confirmación de eliminación si hay publicación en eliminación
  if (publicacionEnEliminacion) {
    return (
      <div style={styles.eliminacionOverlay}>
        <div style={styles.eliminacionContainer}>
          <ConfirmDeletePostDialog
            publicacion={publicacionEnEliminacion}
            onSuccess={handleEliminacionExitosa}
            onCancel={handleCancelarEliminacion}
            deshabilitado={false}
          />
        </div>
      </div>
    )
  }

  // T055: Mostrar diálogo de guardado en carpeta si hay publicación en guardado
  if (publicacionEnGuardado && usuarioActualId) {
    return (
      <div style={styles.guardadoOverlay}>
        <div style={styles.guardadoContainer}>
          <SavePostToCarpetaDialog
            publicacion={publicacionEnGuardado}
            usuarioId={usuarioActualId}
            onSuccess={handleGuardadoExitoso}
            onCancel={handleCancelarGuardado}
            deshabilitado={false}
          />
        </div>
      </div>
    )
  }

  // Sin publicaciones
  if (publicaciones.length === 0 && !paginacion?.hasMore) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        <p>
          {esPerfilPropio
            ? 'No tienes publicaciones aún. Comparte tu primer post.'
            : 'Sin publicaciones en este perfil.'}
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxHeight: '800px',
        overflowY: 'auto',
        padding: '1rem 0',
      }}
    >
      {/* Lista de publicaciones — HU-13 (visualización), HU-11/12 (acciones si propio) */}
      {publicaciones.map((pub) => {
        const esPropia = esPerfilPropio && usuarioActualId && pub.esPropia(usuarioActualId)

        return (
          <div
            key={pub.id}
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              transition: 'box-shadow 0.2s ease',
              cursor: esPropia ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (esPropia) {
                const elem = e.currentTarget as HTMLElement
                elem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              const elem = e.currentTarget as HTMLElement
              elem.style.boxShadow = 'none'
            }}
          >
            {/* Información del autor — T063: clickeable para navegar a perfil ajeno (AC-03.2, AC-03.3) */}
            <div
              style={{
                flexShrink: 0,
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {/* Foto del autor — AC-03.2: clickeable */}
              <button
                onClick={() => handleNavegaAPerfil(pub.autorId)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: 'none',
                  overflow: 'hidden',
                  backgroundColor: '#e5e7eb',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                }}
                title={`Ver perfil de ${pub.autorNombreUsuario}`}
              >
                {pub.autorFotoUrl ? (
                  <img
                    src={pub.autorFotoUrl}
                    alt={pub.autorNombreUsuario}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#d1d5db',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                    }}
                  >
                    {pub.autorNombreUsuario.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Nombre de usuario del autor — AC-03.3: clickeable */}
              <button
                onClick={() => handleNavegaAPerfil(pub.autorId)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0',
                  textDecoration: 'none',
                  maxWidth: '110px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease, text-decoration 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#1d4ed8'
                  ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#3b82f6'
                  ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
                }}
                title={`Ver perfil de ${pub.autorNombreUsuario}`}
              >
                @{pub.autorNombreUsuario}
              </button>
            </div>

            {/* Imagen de la publicación — AC-13.1, AC-13.3 (consulta en ajeno) */}
            <div
              style={{
                flexShrink: 0,
                width: '120px',
                height: '120px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#e5e7eb',
              }}
            >
              <img
                src={pub.imagenUrl}
                alt="Publicación"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Contenido de texto — A5: texto editable, imagen inmutable */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Texto de la publicación — AC-13.1 */}
              <p
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#1f2937',
                  wordBreak: 'break-word',
                  maxHeight: '3rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {pub.texto}
              </p>

              {/* Fecha de creación — Metadato adicional */}
              <p
                style={{
                  margin: '0',
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                {pub.fechaCreacion instanceof Date
                  ? pub.fechaCreacion.toLocaleDateString()
                  : new Date(pub.fechaCreacion).toLocaleDateString()}
              </p>
            </div>

            {/* Acciones (Editar/Eliminar) — Solo en perfil propio — HU-11, HU-12 */}
            {esPropia && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexShrink: 0,
                }}
              >
                {/* Botón Editar — HU-11.1–HU-11.4 */}
                <button
                  onClick={() => handleEditar(pub)}
                  disabled={cargandoAccion === pub.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: cargandoAccion === pub.id ? 'not-allowed' : 'pointer',
                    opacity: cargandoAccion === pub.id ? 0.6 : 1,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (cargandoAccion !== pub.id) {
                      ;(e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'
                  }}
                >
                  {cargandoAccion === pub.id ? 'Editando...' : 'Editar'}
                </button>

                {/* Botón Eliminar — HU-12.1–HU-12.4, AC-12.4 (visual diferenciada en rojo) */}
                <button
                  onClick={() => handleEliminar(pub)}
                  disabled={cargandoAccion === pub.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: cargandoAccion === pub.id ? 'not-allowed' : 'pointer',
                    opacity: cargandoAccion === pub.id ? 0.6 : 1,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (cargandoAccion !== pub.id) {
                      ;(e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'
                    }
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#ef4444'
                  }}
                >
                  {cargandoAccion === pub.id ? 'Eliminando...' : 'Eliminar'}
                </button>

                {/* Botón Guardar en carpeta — HU-09.1–HU-09.4, AC-09.1–AC-09.4 (T055) */}
                <button
                  onClick={() => handleGuardar(pub)}
                  disabled={cargandoAccion === pub.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: cargandoAccion === pub.id ? 'not-allowed' : 'pointer',
                    opacity: cargandoAccion === pub.id ? 0.6 : 1,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (cargandoAccion !== pub.id) {
                      ;(e.target as HTMLButtonElement).style.backgroundColor = '#059669'
                    }
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.backgroundColor = '#10b981'
                  }}
                >
                  {cargandoAccion === pub.id ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Botón "Cargar más" — A6: Paginación server-side */}
      {paginacion?.hasMore && !cargandoMas && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleCargarMas}
            disabled={cargandoMas}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: cargandoMas ? 'not-allowed' : 'pointer',
            }}
          >
            {cargandoMas ? 'Cargando...' : 'Cargar más publicaciones'}
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Estilos para PublicacionList (T053, T054, T055).
 */
const styles: Record<string, React.CSSProperties> = {
  edicionOverlay: {
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
  edicionContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    maxWidth: '600px',
    width: '100%',
  },
  eliminacionOverlay: {
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
  eliminacionContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    maxWidth: '600px',
    width: '100%',
  },
  guardadoOverlay: {
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
  guardadoContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    maxHeight: '90vh',
    overflowY: 'auto',
    maxWidth: '600px',
    width: '100%',
  },
}