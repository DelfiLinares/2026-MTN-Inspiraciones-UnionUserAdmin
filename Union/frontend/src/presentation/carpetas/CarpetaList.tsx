import React, { useState } from 'react'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import CreateCarpetaDialog from './CreateCarpetaDialog'
import RenameCarpetaDialog from './RenameCarpetaDialog'
import ConfirmDeleteCarpetaDialog from './ConfirmDeleteCarpetaDialog'
import { ManageCarpetaPublicacionesDialog } from './ManageCarpetaPublicacionesDialog'

/**
 * `CarpetaList`: Componente de listado de carpetas de posts guardados.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, HU-10, AC-05–AC-08, AC-10, A3, A6, A7)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", carpetas/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T024, T056, T075)
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
 *    - Acciones: crear, renombrar, eliminar, gestionar publicaciones
 *    - Botones contextuales por carpeta
 *    - Advertencias de eliminación (A7)
 *    - Validación de límite 50 carpetas (AC-05.4)
 *    - Quitar publicaciones de carpeta sin eliminarlas (HU-10, AC-10.1–AC-10.3) [T056]
 *
 * 4. Modo ajeno (perfil de otro usuario):
 *    - SIN acciones (solo consulta)
 *    - Click en carpeta → navega a lista de posts de carpeta
 *
 * 5. T075: Estados de loading/empty/error:
 *    - Loading state: mostrar "Cargando carpetas..." cuando cargando=true
 *    - Empty state: mejorado con mensajes descriptivos cuando no hay carpetas
 *    - Error state: espacio reservado para mostrar errores (cuando se implemente en servicios)
 *
 * Props:
 * - `carpetas: CarpetaPost[]` — Lista de carpetas a renderizar
 * - `esPerfilPropio: boolean` — true si es perfil propio (muestra acciones)
 * - `paginacion?: ResultadoCarpetasPaginado` — Metadata de paginación (A6)
 * - `cargando?: boolean` — true si se están cargando datos (T075)
 * - `onCargarMas?: () => Promise<void>` — Callback para cargar más páginas (A6, pagination)
 * - `onCreate?: () => void` — Callback para crear carpeta (HU-05, T024 de coordinación con T025)
 * - `onRename?: (carpeta: CarpetaPost) => void` — Callback para renombrar (HU-06, A3)
 * - `onDelete?: (carpeta: CarpetaPost) => void` — Callback para eliminar (HU-07, A7)
 * - `onSelectCarpeta?: (carpeta: CarpetaPost) => void` — Callback para seleccionar (navegación)
 * - `onManageCarpetaPublicaciones?: (carpeta: CarpetaPost) => void` — Callback para gestionar publicaciones (HU-10, T056)
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta (botón "Nueva carpeta")
 * - HU-06: Renombrar carpeta (botón por carpeta)
 * - HU-07: Eliminar carpeta (botón por carpeta con advertencia A7)
 * - HU-08: Ver lista de carpetas (render base)
 * - HU-10: Quitar un post de una carpeta (botón "Publicaciones", diálogo para quitar) [T056]
 *
 * Criterios de aceptación:
 * - AC-08.1: Carpetas visibles públicamente (render para ambos)
 * - AC-08.2: Nombre + cantidad de posts (postCount)
 * - AC-08.3: Soportar 50 carpetas sin degradar (scroll, paginación)
 * - AC-05.4: Si ya hay 50 carpetas → botón crear impedido
 * - AC-06.5: Renombrar solo en carpetas propias
 * - AC-07.6: Eliminar solo en carpetas propias
 * - AC-07.7: Eliminar diferenciado visualmente
 * - AC-10.1: Quitar NO elimina el post (solo lo desvincula) [T056]
 * - AC-10.2: Tras quitar, postCount se actualiza [T056]
 * - AC-10.3: La acción solo está disponible en carpetas propias [T056]
 *
 * Clarificaciones:
 * - A3: Nombres únicos por usuario (validado en backend)
 * - A6: Paginación server-side
 * - A7: Eliminar advierte pero no elimina posts reales
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo componente (Principio VI)
 * - Las acciones de edición se implementan en T025–T027 (modales/dialogs)
 * - T056: ManageCarpetaPublicacionesDialog para quitar posts (HU-10)
 * - Este componente es presentational; lógica de servicios en T029
 * - Paginación base = soporte para limit/offset; carga manual "cargar más"
 * - T075: Estados loading/empty/error mejorados
 */

export interface CarpetaListProps {
  carpetas: CarpetaPost[]
  esPerfilPropio: boolean
  paginacion?: ResultadoCarpetasPaginado
  cargando?: boolean
  onCargarMas?: (limit: number, offset: number) => Promise<void>
  onCreate?: () => void
  onRename?: (carpeta: CarpetaPost) => void
  onDelete?: (carpeta: CarpetaPost) => void
  onSelectCarpeta?: (carpeta: CarpetaPost) => void
  onManageCarpetaPublicaciones?: (carpeta: CarpetaPost) => void
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
  onManageCarpetaPublicaciones,
}) => {
  const [cargandoMas, setCargandoMas] = useState(false)
  // T042: Estado para mostrar/ocultar CreateCarpetaDialog
  const [mostrarDialogoCrear, setMostrarDialogoCrear] = useState(false)
  // T043: Estado para mostrar/ocultar RenameCarpetaDialog
  const [mostrarDialogoRenombrar, setMostrarDialogoRenombrar] = useState(false)
  const [carpetaARenombrar, setCarpetaARenombrar] = useState<CarpetaPost | null>(null)
  // T044: Estado para mostrar/ocultar ConfirmDeleteCarpetaDialog
  const [mostrarDialogoEliminar, setMostrarDialogoEliminar] = useState(false)
  const [carpetaAEliminar, setCarpetaAEliminar] = useState<CarpetaPost | null>(null)
  // T045: Estado para paginación server-side (limit y offset)
  const [offsetActual, setOffsetActual] = useState(0)
  // T056: Estado para mostrar/ocultar ManageCarpetaPublicacionesDialog
  const [mostrarDialogoManagePubs, setMostrarDialogoManagePubs] = useState(false)
  const [carpetaAManagear, setCarpetaAManagear] = useState<CarpetaPost | null>(null)

  /**
   * Determinar si el botón "crear" debe estar deshabilitado.
   * AC-05.4: Si ya hay 50 carpetas, no se puede crear más.
   */
  const alcanzoBtnCrear = paginacion?.total !== undefined && paginacion.total >= 50

  /**
   * Manejo de "cargar más" con spinner (A6).
   * T045: Paginación server-side con parámetros limit y offset.
   */
  const handleCargarMas = async () => {
    if (!onCargarMas || cargandoMas) {
      return
    }

    // T045: Calcular siguiente offset basado en paginación actual
    const proximoOffset = offsetActual + (paginacion?.limit || 20)
    const limit = paginacion?.limit || 20

    setCargandoMas(true)
    try {
      await onCargarMas(limit, proximoOffset)
      // Actualizar offset si la carga fue exitosa
      setOffsetActual(proximoOffset)
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

  /**
   * T042: Manejo de creación de carpeta exitosa.
   * Cierra diálogo y notifica al padre si hay callback onCreate.
   * T045: Resetea offset para recargar desde el principio.
   */
  const handleCarpetaCreada = (carpetaCreada: CarpetaPost) => {
    // Cerrar diálogo
    setMostrarDialogoCrear(false)

    // T045: Resetear offset al crear, ya que la lista cambia
    setOffsetActual(0)

    // Notificar al padre (PerfilPropio) para recargar lista
    if (onCreate) {
      onCreate()
    }
  }

  /**
   * T042: Manejo de cancelación de diálogo de crear.
   */
  const handleCancelarDialogo = () => {
    setMostrarDialogoCrear(false)
  }

  /**
   * T043: Manejo de renombrado de carpeta exitoso.
   * Cierra diálogo y notifica al padre si hay callback onRename.
   * T045: Resetea offset para refrescar la lista ordenada.
   */
  const handleCarpetaRenombrada = (carpetaRenombrada: CarpetaPost) => {
    // Cerrar diálogo
    setMostrarDialogoRenombrar(false)
    setCarpetaARenombrar(null)

    // T045: Resetear offset al renombrar
    setOffsetActual(0)

    // Notificar al padre (PerfilPropio) para recargar lista con nombres actualizados
    if (onRename) {
      onRename(carpetaRenombrada)
    }
  }

  /**
   * T043: Manejo de cancelación de diálogo de renombrar.
   */
  const handleCancelarRenombrar = () => {
    setMostrarDialogoRenombrar(false)
    setCarpetaARenombrar(null)
  }

  /**
   * T043: Abre el diálogo de renombrar con la carpeta seleccionada.
   */
  const handleAbrirRenombrar = (carpeta: CarpetaPost) => {
    setCarpetaARenombrar(carpeta)
    setMostrarDialogoRenombrar(true)
  }

  /**
   * T044: Manejo de eliminación de carpeta exitosa.
   * Cierra diálogo y notifica al padre si hay callback onDelete.
   * Actualiza visualmente el cupo (paginación.total disminuye).
   * T045: Resetea offset para refrescar la lista.
   */
  const handleCarpetaEliminada = () => {
    // Guardar referencia a la carpeta eliminada antes de limpiar estado
    const carpetaEliminada = carpetaAEliminar

    // Cerrar diálogo
    setMostrarDialogoEliminar(false)
    setCarpetaAEliminar(null)

    // T045: Resetear offset al eliminar
    setOffsetActual(0)

    // Notificar al padre (PerfilPropio) para recargar lista y actualizar cupo
    if (onDelete && carpetaEliminada) {
      onDelete(carpetaEliminada)
    }
  }

  /**
   * T044: Manejo de cancelación de diálogo de eliminar.
   */
  const handleCancelarEliminar = () => {
    setMostrarDialogoEliminar(false)
    setCarpetaAEliminar(null)
  }

  /**
   * T056: Manejo para abrir diálogo de gestión de publicaciones de carpeta.
   * Abre ManageCarpetaPublicacionesDialog para quitar posts de la carpeta (HU-10).
   */
  const handleAbrirManagePubs = (carpeta: CarpetaPost) => {
    setCarpetaAManagear(carpeta)
    setMostrarDialogoManagePubs(true)
  }

  /**
   * T056: Manejo de cierre de diálogo de gestión de publicaciones.
   */
  const handleCerrarManagePubs = () => {
    setMostrarDialogoManagePubs(false)
    setCarpetaAManagear(null)
  }

  /**
   * T056: Manejo cuando se quita una publicación de la carpeta.
   * AC-10.2: Actualiza postCount y notifica al padre.
   */
  const handlePublicacionQuitada = (carpeta: CarpetaPost, publicacionId: string) => {
    // Notificar al padre (PerfilPropio) para refrescar postCount
    if (onManageCarpetaPublicaciones) {
      onManageCarpetaPublicaciones(carpeta)
    }
  }

  /**
   * T044: Abre el diálogo de confirmación de eliminación con la carpeta seleccionada.
   */
  const handleAbrirEliminar = (carpeta: CarpetaPost) => {
    setCarpetaAEliminar(carpeta)
    setMostrarDialogoEliminar(true)
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
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>
          Carpetas {paginacion?.total !== undefined ? `(${paginacion.total})` : ''}
        </h2>

        {/* AC-05.4: Botón crear disponible solo si < 50 carpetas y es perfil propio */}
        {esPerfilPropio && onCreate && (
          <button
            onClick={() => setMostrarDialogoCrear(true)}
            disabled={alcanzoBtnCrear || cargando}
            title={alcanzoBtnCrear ? 'Has alcanzado el límite de 50 carpetas' : ''}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: alcanzoBtnCrear ? 'var(--color-control)' : 'var(--color-muted)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: alcanzoBtnCrear ? 'not-allowed' : 'pointer',
              opacity: alcanzoBtnCrear ? 0.5 : 1,
            }}
          >
            + Nueva carpeta
          </button>
        )}
      </div>

      {/* Mensaje si carpetas vacías o loading (T075: Estados de loading/empty/error) */}
      {cargando ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>Cargando carpetas...</p>
        </div>
      ) : carpetas.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            color: 'var(--color-muted)',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '15px', fontWeight: '500' }}>
            {esPerfilPropio ? 'No hay carpetas aún' : 'Sin carpetas públicas'}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
            {esPerfilPropio
              ? 'Crea una carpeta para organizar tus posts guardados'
              : 'Este usuario no tiene carpetas públicas'}
          </p>
        </div>
      ) : null}

      {/* AC-08.3: Grid responsivo con scroll para máx 50 carpetas (solo si hay items y no está cargando) */}
      {!cargando && carpetas.length > 0 && (
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
              backgroundColor: 'var(--color-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '1rem',
              cursor: esPerfilPropio ? 'default' : 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!esPerfilPropio) {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-muted)'
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'
            }}
          >
            {/* AC-08.2: Nombre + postCount */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>
                {carpeta.nombre}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', color: 'var(--color-muted)' }}>
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
                      handleAbrirRenombrar(carpeta)
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
                      handleAbrirEliminar(carpeta)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      backgroundColor: 'var(--color-error-surface)',
                      color: 'var(--color-error)',
                      border: '1px solid #fca5a5',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-error)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-error-surface)'
                    }}
                  >
                    Eliminar
                  </button>
                )}

                {/* HU-10: Botón gestionar publicaciones (T056) — Quitar posts sin eliminar (AC-10.1–AC-10.3) */}
                {carpeta.postCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAbrirManagePubs(carpeta)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.5rem',
                      backgroundColor: 'var(--color-success-surface)',
                      color: '#0d9488',
                      border: '1px solid #6ee7b7',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#a7f3d0'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-success-surface)'
                    }}
                  >
                    Publicaciones ({carpeta.postCount})
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Spinner mientras se cargan más (A6, paginación) */}
      {cargando && carpetas.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '14px' }}>
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
              backgroundColor: 'var(--color-subtle)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-control)',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: cargandoMas ? 'not-allowed' : 'pointer',
            }}
          >
            {cargandoMas ? 'Cargando...' : 'Cargar más carpetas'}
          </button>
        </div>
      )}

      {/* T042: Diálogo de crear carpeta (integración con CreateCarpetaDialog) */}
      {mostrarDialogoCrear && esPerfilPropio && (
        <CreateCarpetaDialog
          carpetasActuales={carpetas}
          onSuccess={handleCarpetaCreada}
          onCancel={handleCancelarDialogo}
        />
      )}

      {/* T043: Diálogo de renombrar carpeta (integración con RenameCarpetaDialog) */}
      {mostrarDialogoRenombrar && esPerfilPropio && carpetaARenombrar && (
        <RenameCarpetaDialog
          carpeta={carpetaARenombrar}
          onSuccess={handleCarpetaRenombrada}
          onCancel={handleCancelarRenombrar}
        />
      )}

      {/* T044: Diálogo de confirmación de eliminación (integración con ConfirmDeleteCarpetaDialog) */}
      {mostrarDialogoEliminar && esPerfilPropio && carpetaAEliminar && (
        <ConfirmDeleteCarpetaDialog
          carpeta={carpetaAEliminar}
          onSuccess={handleCarpetaEliminada}
          onCancel={handleCancelarEliminar}
        />
      )}

      {/* T056: Diálogo de gestión de publicaciones de carpeta (integración con ManageCarpetaPublicacionesDialog) */}
      {mostrarDialogoManagePubs && esPerfilPropio && carpetaAManagear && (
        <ManageCarpetaPublicacionesDialog
          carpeta={carpetaAManagear}
          onQuitar={handlePublicacionQuitada}
          onCancel={handleCerrarManagePubs}
          deshabilitado={false}
        />
      )}
    </div>
  )
}

