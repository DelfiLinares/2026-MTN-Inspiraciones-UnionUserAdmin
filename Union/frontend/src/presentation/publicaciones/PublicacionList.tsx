import React, { useState } from 'react'
import { Publicacion } from '../../domain/Publicacion'

/**
 * Componente PublicacionList — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-11, HU-12, HU-13)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, componentes de presentación)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Entidad: Publicacion)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (schema: PaginaPublicaciones)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T025)
 *
 * Renderiza la lista de publicaciones de un perfil (propio o ajeno) con paginación.
 *
 * Funcionalidades:
 * - HU-13.1–HU-13.3: Visualizar todas las publicaciones del usuario en modo consulta (perfil ajeno)
 * - HU-11.1–HU-11.4: Editar publicación propia (solo en perfil propio, con confirmación)
 * - HU-12.1–HU-12.4: Eliminar publicación propia (solo en perfil propio, con confirmación, visual diferenciada)
 * - A6 (paginación server-side): Botón "Cargar más" cuando hasMore = true
 *
 * Props:
 * - publicaciones: Publicacion[] — Array de publicaciones en la página actual
 * - paginacion?: { items, total, limit, offset, hasMore } — Metadatos de paginación (A6)
 * - esPerfilPropio: boolean — Si true, muestra botones de editar/eliminar
 * - usuarioActualId?: string — ID del usuario actual (para verificación esPropia())
 * - onEditar?: (publicacion: Publicacion) => void — Callback para editar (AC-11.2)
 * - onEliminar?: (publicacionId: string) => void — Callback para eliminar (AC-12.2)
 * - onCargarMas?: () => void — Callback para cargar siguiente página (A6)
 * - cargando?: boolean — Indica si se está cargando la página actual
 * - cargandoMas?: boolean — Indica si se está cargando la siguiente página
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
}) => {
  const [cargandoAccion, setCargandoAccion] = useState<string | null>(null)

  /**
   * Manejador para editar publicación.
   * HU-11: Abre modal/formulario de edición (AC-11.2, AC-11.3).
   */
  const handleEditar = (publicacion: Publicacion) => {
    if (onEditar) {
      setCargandoAccion(publicacion.id)
      // Simular delay de carga; en implementación real, el servicio maneja esto
      setTimeout(() => {
        onEditar(publicacion)
        setCargandoAccion(null)
      }, 300)
    }
  }

  /**
   * Manejador para eliminar publicación.
   * HU-12: Muestra confirmación, luego elimina (AC-12.2, AC-12.3).
   */
  const handleEliminar = (publicacionId: string) => {
    if (onEliminar) {
      // Simulación: En un caso real, aquí aparecería un modal de confirmación
      // que advierte sobre la pérdida permanente (AC-12.2)
      if (confirm('¿Eliminar esta publicación? Esta acción no puede deshacerse.')) {
        setCargandoAccion(publicacionId)
        setTimeout(() => {
          onEliminar(publicacionId)
          setCargandoAccion(null)
        }, 300)
      }
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

  // Estado de carga general (mientras se obtienen publicaciones)
  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando publicaciones...</p>
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
                  onClick={() => handleEliminar(pub.id)}
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
