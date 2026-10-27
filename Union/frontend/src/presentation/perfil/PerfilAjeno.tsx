import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsuarioPerfil as Usuario } from '../../domain/UsuarioPerfil'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import type { ResultadoPublicacionesPaginado } from '../../application/ports/PublicacionRepository'
import { carpetaService } from '../../services/carpetaPerfilService'
import { publicacionService } from '../../services/perfilPublicacionService'
import { CarpetaList } from '../carpetas/CarpetaList'
import { PublicacionList } from '../publicaciones/PublicacionList'
import { FollowButton } from '../seguimiento/FollowButton'

const TAMANIO_PAGINA = 20

/**
 * `PerfilAjeno`: Vista de perfil ajeno con opción de seguimiento (modo consulta).
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-03, HU-04, HU-13, AC-03, AC-04, A4, A10, CB-17, CB-18)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T021, T057, T061, T074)
 *
 * Responsabilidades:
 * 1. Muestra encabezado del perfil (AC-03.1):
 *    - Foto de perfil
 *    - Nombre de usuario
 *    - "Sobre mí" (sobreMi, ≤80 chars)
 *    - Descripción (≤200 chars)
 *    - Cantidad de seguidores
 *
 * 2. Ofrece acción de seguimiento con FollowButton (AC-04.1, T061 + A4):
 *    - Componente FollowButton para toggle "Seguir" / "Dejar de seguir"
 *    - AC-04.2: Disponible para cualquier autenticado (sin distinción de rol)
 *    - AC-04.3: Refleja estado de seguimiento tras éxito
 *    - AC-04.4: Maneja errores, no cambia estado si falla
 *    - AC-04.5: NO requiere confirmación explícita
 *    - A4: Toggle bidireccional (seguir ↔ dejar de seguir)
 *
 * 3. Modo consulta sin edición (AC-03.4):
 *    - SIN botón "Editar perfil"
 *    - SIN botón "Cambiar foto"
 *    - SIN acciones de gestión de carpetas (crear, renombrar, eliminar)
 *    - SIN acciones de edición/eliminación de publicaciones
 *
 * 4. Muestra carpetas ajenas (AC-03.5):
 *    - Carpetas en modo lectura
 *    - Nombre y cantidad de posts
 *    - SIN acciones de gestión
 *    - T074: Estados de loading/empty/error (CB-17: mostrar vacío si sin carpetas)
 *
 * 5. Muestra publicaciones ajenas en modo consulta (AC-03.1, HU-13, T057):
 *    - En modo lectura (AC-13.3)
 *    - SIN opciones de editar/eliminar
 *    - SIN callbacks de acción
 *    - PublicacionList con esPerfilPropio=false
 *    - T074: Estados de loading/empty/error (CB-18: mostrar vacío si sin publicaciones)
 *
 * Props:
 * - `usuario: Usuario` — Usuario ajeno cuyo perfil se visualiza
 * - `usuarioActual: Usuario` — Usuario autenticado actual (para determinar si puede seguir)
 * - `seguimiento?: SeguimientoRelacion` — Estado de seguimiento (opcional, para HU-04)
 * - `carpetas?: CarpetaPost[]` — Carpetas públicas del usuario ajeno (opcional)
 * - `publicaciones?: PublicacionPerfil[]` — Publicaciones propias del usuario ajeno (opcional)
 * - `cargando?: boolean` — true si se están cargando datos (opcional, para skeleton)
 * - `onSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void>` — Callback para toggle de seguimiento (HU-04, T061)
 *
 * Historias de usuario:
 * - HU-03: Visualizar perfil de otra persona
 * - HU-04: Seguir a otra persona (con A4: bidireccional toggle, integración con FollowButton, T061)
 * - HU-13: Visualizar publicaciones del perfil (integración con PublicacionList, T057)
 *
 * Clarificaciones:
 * - A4: Botón alterna entre "Seguir" / "Dejar de seguir" (bidireccional)
 * - A10: Perfil BANEADO/ELIMINADO no es visible (validación en PerfilPage)
 * - CB-17: Perfil sin carpetas → estado vacío
 * - CB-18: Perfil sin publicaciones → estado vacío
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo contenido (Principio VI)
 * - Optimistic update: Toggle local inmediato, revert si error (AC-04.3, AC-04.4)
 * - T061: Integración de FollowButton para UI reutilizable de seguimiento
 * - T057: Integración de lista de publicaciones en modo lectura (sin callbacks de acción)
 * - T074: Estados loading/empty/error en carpetas y publicaciones (CB-17, CB-18)
 */

export interface PerfilAjenoProps {
  usuario: Usuario
  usuarioActual: Pick<Usuario, 'id'>
  seguimiento?: SeguimientoRelacion
  carpetas?: CarpetaPost[]
  publicaciones?: PublicacionPerfil[]
  cargando?: boolean
  onSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void>
}

export const PerfilAjeno: React.FC<PerfilAjenoProps> = ({
  usuario,
  usuarioActual,
  seguimiento,
  carpetas = [],
  publicaciones = [],
  cargando = false,
  onSeguimiento,
}) => {
  const navigate = useNavigate()
  const [seguimientoLocal, setSeguimientoLocal] = useState<SeguimientoRelacion | undefined>(seguimiento)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | undefined>()

  // T046: Estado para carpetas y paginación (modo consulta, sin acciones)
  const [carpetasActuales, setCarpetasActuales] = useState(carpetas)
  const [paginacionCarpetas, setPaginacionCarpetas] = useState<ResultadoCarpetasPaginado | undefined>(
    carpetas.length > 0
      ? {
          items: carpetas,
          total: carpetas.length,
          limit: 20,
          offset: 0,
          hasMore: false,
        }
      : undefined
  )
  const [cargandoCarpetas, setCargandoCarpetas] = useState(true)

  // T074: Error states for carpetas
  const [errorCarpetas, setErrorCarpetas] = useState<string>('')

  // T057: Estado para publicaciones ajenas (modo consulta, sin acciones)
  const [publicacionesActuales, setPublicacionesActuales] = useState(publicaciones)
  const [paginacionPublicaciones, setPaginacionPublicaciones] =
    useState<ResultadoPublicacionesPaginado>()
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(true)
  const [cargandoMasPublicaciones, setCargandoMasPublicaciones] = useState(false)

  // T074: Error states for publicaciones
  const [errorPublicaciones, setErrorPublicaciones] = useState<string>('')

  const cargarCarpetas = useCallback(
    async (limit: number, offset: number, anexar: boolean) => {
      if (!anexar) {
        setCargandoCarpetas(true)
      }
      setErrorCarpetas('')
      try {
        const resultado = await carpetaService.listarCarpetas(
          usuario.id,
          limit,
          offset,
        )
        setCarpetasActuales((actuales) =>
          anexar ? [...actuales, ...resultado.carpetas] : resultado.carpetas,
        )
        setPaginacionCarpetas((actual) => ({
          items: anexar
            ? [...(actual?.items ?? []), ...resultado.carpetas]
            : resultado.carpetas,
          total: resultado.total,
          limit: resultado.limit,
          offset: resultado.offset,
          hasMore: resultado.offset + resultado.carpetas.length < resultado.total,
        }))
      } catch (error) {
        setErrorCarpetas(
          error instanceof Error ? error.message : 'No se pudieron cargar las carpetas.',
        )
        throw error
      } finally {
        if (!anexar) {
          setCargandoCarpetas(false)
        }
      }
    },
    [usuario.id],
  )

  const cargarPublicaciones = useCallback(
    async (limit: number, offset: number, anexar: boolean) => {
      if (!anexar) {
        setCargandoPublicaciones(true)
      }
      setErrorPublicaciones('')
      try {
        const resultado = await publicacionService.listarPublicaciones(
          usuario.id,
          limit,
          offset,
        )
        setPublicacionesActuales((actuales) =>
          anexar ? [...actuales, ...resultado.items] : resultado.items,
        )
        setPaginacionPublicaciones((actual) => ({
          ...resultado,
          items: anexar ? [...(actual?.items ?? []), ...resultado.items] : resultado.items,
        }))
      } catch (error) {
        setErrorPublicaciones(
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las publicaciones.',
        )
      } finally {
        if (!anexar) {
          setCargandoPublicaciones(false)
        }
        setCargandoMasPublicaciones(false)
      }
    },
    [usuario.id],
  )

  useEffect(() => {
    setSeguimientoLocal(seguimiento)
  }, [
    seguimiento?.usuarioId,
    seguimiento?.usuarioASeguidoId,
    seguimiento?.siguiendo,
  ])

  useEffect(() => {
    setCarpetasActuales([])
    setPublicacionesActuales([])
    setPaginacionCarpetas(undefined)
    setPaginacionPublicaciones(undefined)
    void cargarCarpetas(TAMANIO_PAGINA, 0, false).catch(() => undefined)
    void cargarPublicaciones(TAMANIO_PAGINA, 0, false)
  }, [cargarCarpetas, cargarPublicaciones])

  const handleSeguimiento = async (nuevoEstado: SeguimientoRelacion) => {
    setError(undefined)
    setEnviando(true)
    try {
      await onSeguimiento?.(nuevoEstado)
      setSeguimientoLocal(nuevoEstado)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'No se pudo actualizar el seguimiento.',
      )
      throw error
    } finally {
      setEnviando(false)
    }
  }

  /**
   * T046: Handler para cargar más carpetas en modo consulta (sin acciones).
   * En perfil ajeno, solo permite visualización sin edición.
   */
  const handleCargarMasCarpetasAjeno = async (limit: number, offset: number) => {
    await cargarCarpetas(limit, offset, true)
  }

  /**
   * T046: Handler para seleccionar una carpeta en modo ajeno.
   * Navega a la lista de posts de la carpeta (sin permisos de edición).
   */
  const handleSeleccionarCarpetaAjena = (carpeta: CarpetaPost) => {
    navigate(`/carpeta/${encodeURIComponent(carpeta.id)}`)
  }

  const handleCargarMasPublicaciones = () => {
    if (!paginacionPublicaciones?.hasMore || cargandoMasPublicaciones) {
      return
    }
    setCargandoMasPublicaciones(true)
    void cargarPublicaciones(
      paginacionPublicaciones.limit,
      paginacionPublicaciones.offset + paginacionPublicaciones.limit,
      true,
    )
  }

  if (cargando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="trama-profile">
      {/* AC-03.1: Encabezado de perfil ajeno con datos públicos */}
      <section className="trama-profile-header">
        <div className="trama-profile-identity">
          {/* Foto de perfil */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {usuario.foto ? (
              <img
                src={usuario.foto}
                alt={usuario.username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-muted)' }}>
                {usuario.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Datos personales */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '20px', fontWeight: '700' }}>
                @{usuario.username}
              </h1>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: 'var(--color-muted)' }}>
                {usuario.cantidadSeguidores} {usuario.cantidadSeguidores === 1 ? 'seguidor' : 'seguidores'}
              </p>
            </div>

            {/* Sobre mí */}
            {usuario.sobreMi && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text)' }}>{usuario.sobreMi}</p>
              </div>
            )}

            {/* Descripción */}
            {usuario.descripcion && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-muted)' }}>{usuario.descripcion}</p>
              </div>
            )}

            {/* AC-04.1 + A4: Integración de FollowButton (T061) */}
            <div style={{ marginTop: '1rem' }}>
              {/* AC-03.4: NO mostrar acciones de edición (a diferencia de PerfilPropio) */}
              {/* AC-04.1: En perfil ajeno se muestra opción de seguir */}
              {seguimientoLocal && usuario.debeMostrarBotonSeguir(usuarioActual.id) && (
                <FollowButton
                  seguimiento={seguimientoLocal}
                  onToggleSeguimiento={handleSeguimiento}
                  enviando={enviando}
                  error={error}
                  onErrorClear={() => setError(undefined)}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AC-03.5: Carpetas ajenas en modo consulta (T046: Integración de CarpetaList) */}
      {/* T074: Estados de loading/empty/error para carpetas */}
      <section style={{ marginBottom: '2rem' }}>
        {errorCarpetas && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              color: '#c33',
              marginBottom: '1rem',
              fontSize: '14px',
            }}
          >
            <strong>Error:</strong> {errorCarpetas}
          </div>
        )}

        {cargandoCarpetas ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>Cargando carpetas...</p>
          </div>
        ) : carpetasActuales.length === 0 ? (
          // CB-17: Empty state when no carpetas
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
              No hay carpetas
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
              Este usuario aún no ha creado carpetas
            </p>
          </div>
        ) : (
          <CarpetaList
            carpetas={carpetasActuales}
            esPerfilPropio={false}
            paginacion={paginacionCarpetas}
            cargando={cargandoCarpetas}
            onCargarMas={handleCargarMasCarpetasAjeno}
            onSelectCarpeta={handleSeleccionarCarpetaAjena}
          />
        )}
      </section>

      {/* AC-03.1 + AC-03.5: Publicaciones ajenas en modo lectura (T057: Integración con PublicacionList sin callbacks) */}
      {/* T074: Estados de loading/empty/error para publicaciones */}
      <section>
        {errorPublicaciones && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              color: '#c33',
              marginBottom: '1rem',
              fontSize: '14px',
            }}
          >
            <strong>Error:</strong> {errorPublicaciones}
          </div>
        )}

        {cargandoPublicaciones ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>Cargando publicaciones...</p>
          </div>
        ) : publicacionesActuales.length === 0 ? (
          // CB-18: Empty state when no publicaciones
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
              No hay publicaciones
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
              Este usuario aún no ha compartido publicaciones
            </p>
          </div>
        ) : (
          <PublicacionList
            publicaciones={publicacionesActuales}
            paginacion={paginacionPublicaciones}
            esPerfilPropio={false}
            cargando={cargandoPublicaciones}
            cargandoMas={cargandoMasPublicaciones}
            onCargarMas={handleCargarMasPublicaciones}
          />
        )}
      </section>
    </div>
  )
}
