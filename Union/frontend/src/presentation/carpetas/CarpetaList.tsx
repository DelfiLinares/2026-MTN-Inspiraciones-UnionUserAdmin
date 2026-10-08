import React, { useState } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'

/**
 * `CarpetaList`: Componente de listado de carpetas de posts guardados.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, AC-05–AC-08, A3, A6, A7)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T024)
 *
 * Responsabilidades:
 * 1. Render de carpetas públicas (AC-08.1, AC-08.2):
 *    - Mostrar nombre de carpeta
 *    - Mostrar cantidad de posts (postCount)
 *    - Accesible desde perfil propio y ajeno
 *
 * 2. Paginación base (A6, AC-08.3):
 *    - Soportar hasta 50 carpetas (RF-22)
 *    - Paginación server-side (parámetros limit/offset)
 *    - Indicador "cargar más" si hay más carpetas
 *    - Scroll responsivo sin degradar interfaz (AC-08.3)
 *
 * 3. Modo propio (perfil propio):
 *    - Acciones: crear, renombrar, eliminar
 *    - Botones contextuales por carpeta
 *    - Advertencias de eliminación (A7)
 *    - Validación de límite 50 carpetas (AC-05.4)
 *
 * 4. Modo ajeno (perfil de otro usuario):
 *    - SIN acciones (solo consulta)
 *    - Click en carpeta → navega a lista de posts de carpeta
 *
 * Props:
 * - `carpetas: CarpetaPost[]` — Lista de carpetas a renderizar
 * - `esPerfilPropio: boolean` — true si es perfil propio (muestra acciones)
 * - `paginacion?: ResultadoCarpetasPaginado` — Metadata de paginación (A6)
 * - `cargando?: boolean` — true si se están cargando datos
 * - `onCargarMas?: () => Promise<void>` — Callback para cargar más páginas (A6, pagination)
 * - `onCreate?: () => void` — Callback para crear carpeta (HU-05, T024 de coordinación con T025)
 * - `onRename?: (carpeta: CarpetaPost) => void` — Callback para renombrar (HU-06, A3)
 * - `onDelete?: (carpeta: CarpetaPost) => void` — Callback para eliminar (HU-07, A7)
 * - `onSelectCarpeta?: (carpeta: CarpetaPost) => void` — Callback para seleccionar (navegación)
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta (botón "Nueva carpeta")
 * - HU-06: Renombrar carpeta (botón por carpeta)
 * - HU-07: Eliminar carpeta (botón por carpeta con advertencia A7)
 * - HU-08: Ver lista de carpetas (render base)
 *
 * Criterios de aceptación:
 * - AC-08.1: Carpetas visibles públicamente (render para ambos)
 * - AC-08.2: Nombre + cantidad de posts (postCount)
 * - AC-08.3: Soportar 50 carpetas sin degradar (scroll, paginación)
 * - AC-05.4: Si ya hay 50 carpetas → botón crear impedido
 * - AC-06.5: Renombrar solo en carpetas propias
 * - AC-07.6: Eliminar solo en carpetas propias
 * - AC-07.7: Eliminar diferenciado visualmente
 *
 * Clarificaciones:
 * - A3: Nombres únicos por usuario (validado en backend)
 * - A6: Paginación server-side
 * - A7: Eliminar advierte pero no elimina posts reales
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo componente (Principio VI)
 * - Las acciones de edición se implementan en T025–T027 (modales/dialogs)
 * - Este componente es presentational; lógica de servicios en T029
 * - Paginación base = soporte para limit/offset; carga manual "cargar más"
 */

export interface CarpetaListProps {
  carpetas: CarpetaPost[]
  esPerfilPropio: boolean
  paginacion?: ResultadoCarpetasPaginado
  cargando?: boolean
  onCargarMas?: () => Promise<void>
  onCreate?: () => void
  onRename?: (carpeta: CarpetaPost) => void
  onDelete?: (carpeta: CarpetaPost) => void
  onSelectCarpeta?: (carpeta: CarpetaPost) => void
}

export const CarpetaList: React.FC<CarpetaListProps> = ({
  carpetas,
  esPerfilPropio,
  paginacion,
  cargando = false,
  onCargarMas,
  onCreate,
  onRename,
  onDelete,
  onSelectCarpeta,
}) => {
  const [cargandoMas, setCargandoMas] = useState(false)

  /**
   * Determinar si el botón "crear" debe estar deshabilitado.
   * AC-05.4: Si ya hay 50 carpetas, no se puede crear más.
   */
  const alcanzoBtnCrear = paginacion?.total !== undefined && paginacion.total >= 50

  /**
   * Manejo de "cargar más" con spinner (A6).
   */
  const handleCargarMas = async () => {
    if (!onCargarMas || cargandoMas) {
      return
    }
    setCargandoMas(true)
    try {
      await onCargarMas()
    } catch (err) {
      console.error('Error cargando más carpetas:', err)
    } finally {
      setCargandoMas(false)
    }
  }

  /**
   * Manejo de click en carpeta (modo ajeno o consulta).
   */
  const handleSelectCarpeta = (carpeta: CarpetaPost) => {
    if (onSelectCarpeta) {
      onSelectCarpeta(carpeta)
    }
  }

  return (
    <div style={{ padding: '0 0 2rem 0' }}>
      {/* Encabezado + botón crear (solo perfil propio) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          Carpetas {paginacion?.total !== undefined ? `(${paginacion.total})` : ''}
        </h2>

        {/* AC-05.4: Botón crear disponible solo si < 50 carpetas y es perfil propio */}
        {esPerfilPropio && onCreate && (
          <button
            onClick={onCreate}
            disabled={alcanzoBtnCrear || cargando}
            title={alcanzoBtnCrear ? 'Has alcanzado el límite de 50 carpetas' : ''}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: alcanzoBtnCrear ? '#d1d5db' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: alcanzoBtnCrear ? 'not-allowed' : 'pointer',
              opacity: alcanzoBtnCrear ? 0.5 : 1,
            }}
          >
            + Nueva carpeta
          </button>
        )}
      </div>

      {/* Mensaje si carpetas vacías */}
      {carpetas.length === 0 && !cargando && (
        <div style={{ padding: '1rem', color: '#9ca3af', textAlign: 'center', fontSize: '13px' }}>
          {esPerfilPropio ? 'Aún no tienes carpetas. Crea una para organizar tus posts.' : 'Sin carpetas públicas.'}
        </div>
      )}

      {/* AC-08.3: Grid responsivo con scroll para máx 50 carpetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
          maxHeight: '600px',
          overflowY: 'auto',
          padding: '0.5rem',
        }}
      >
        {carpetas.map((carpeta) => (
          <div
            key={carpeta.id}
            onClick={() => handleSelectCarpeta(carpeta)}
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '1rem',
              cursor: esPerfilPropio ? 'default' : 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!esPerfilPropio) {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#4f46e5'
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb'
            }}
          >
            {/* AC-08.2: Nombre + postCount */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                {carpeta.nombre}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '11px', color: '#6b7280' }}>
                {carpeta.postCount} post{carpeta.postCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Acciones (solo perfil propio) */}
            {esPerfilPropio && (onRename || onDelete) && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* HU-06: Botón renombrar */}
                {onRename && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRename(carpeta)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      backgroundColor: '#dbeafe',
                      color: '#0369a1',
                      border: '1px solid #7dd3fc',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#bae6fd'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dbeafe'
                    }}
                  >
                    Renombrar
                  </button>
                )}

                {/* HU-07: Botón eliminar (AC-07.7: diferenciado visualmente) */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(carpeta)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fecaca'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fee2e2'
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spinner mientras se cargan más (A6, paginación) */}
      {cargando && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '12px' }}>
          Cargando carpetas...
        </div>
      )}

      {/* Botón "cargar más" si hay más (A6, paginación base) */}
      {paginacion?.hasMore && !cargando && onCargarMas && (
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
            {cargandoMas ? 'Cargando...' : 'Cargar más carpetas'}
          </button>
        </div>
      )}
    </div>
  )
}
