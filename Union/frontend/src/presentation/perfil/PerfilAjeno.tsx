import React, { useState } from 'react'
import { Usuario } from '../../domain/Usuario'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { Publicacion } from '../../domain/Publicacion'
import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import { CarpetaList } from '../carpetas/CarpetaList'
import { PublicacionList } from '../publicaciones/PublicacionList'

/**
 * `PerfilAjeno`: Vista de perfil ajeno con opción de seguimiento (modo consulta).
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-03, HU-04, HU-13, AC-03, AC-04, A4, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T021, T057)
 *
 * Responsabilidades:
 * 1. Muestra encabezado del perfil (AC-03.1):
 *    - Foto de perfil
 *    - Nombre de usuario
 *    - "Sobre mí" (sobreMi, ≤80 chars)
 *    - Descripción (≤200 chars)
 *    - Cantidad de seguidores
 *
 * 2. Ofrece acción de seguimiento (AC-04.1 + A4):
 *    - Botón "Seguir" / "Dejar de seguir" (toggle bidireccional)
 *    - AC-04.2: Disponible para cualquier autenticado (sin distinción de rol)
 *    - AC-04.3: Refleja estado de seguimiento tras éxito
 *    - AC-04.4: Maneja errores, no cambia estado si falla
 *    - AC-04.5: NO requiere confirmación explícita
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
 *
 * 5. Muestra publicaciones ajenas en modo consulta (AC-03.1, HU-13, T057):
 *    - En modo lectura (AC-13.3)
 *    - SIN opciones de editar/eliminar
 *    - SIN callbacks de acción
 *    - PublicacionList con esPerfilPropio=false
 *
 * Props:
 * - `usuario: Usuario` — Usuario ajeno cuyo perfil se visualiza
 * - `usuarioActual: Usuario` — Usuario autenticado actual (para determinar si puede seguir)
 * - `seguimiento?: SeguimientoRelacion` — Estado de seguimiento (opcional, para T029)
 * - `carpetas?: CarpetaPost[]` — Carpetas públicas del usuario ajeno (opcional)
 * - `publicaciones?: Publicacion[]` — Publicaciones propias del usuario ajeno (opcional)
 * - `cargando?: boolean` — true si se están cargando datos (opcional, para skeleton)
 * - `onSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void>` — Callback para toggling (T029)
 *
 * Historias de usuario:
 * - HU-03: Visualizar perfil de otra persona
 * - HU-04: Seguir a otra persona (con A4: bidireccional toggle)
 * - HU-13: Visualizar publicaciones del perfil (integración con PublicacionList, T057)
 *
 * Clarificaciones:
 * - A4: Botón alterna entre "Seguir" / "Dejar de seguir" (bidireccional)
 * - A10: Perfil BANEADO/ELIMINADO no es visible (validación en PerfilPage)
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo contenido (Principio VI)
 * - Optimistic update: Toggle local inmediato, revert si error (AC-04.3, AC-04.4)
 * - La lógica de servicios depende de T029 (PerfilService)
 * - No hay confirmación explícita para seguir (AC-04.5)
 * - T057: Integración de lista de publicaciones en modo lectura (sin callbacks de acción)
 */

export interface PerfilAjenoProps {
  usuario: Usuario
  usuarioActual: Usuario
  seguimiento?: SeguimientoRelacion
  carpetas?: CarpetaPost[]
  publicaciones?: Publicacion[]
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
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false)

  // T057: Estado para publicaciones ajenas (modo consulta, sin acciones)
  const [publicacionesActuales, setPublicacionesActuales] = useState(publicaciones)
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(false)

  /**
   * AC-04: Handle follow/unfollow toggle (A4).
   * Implementa optimistic update: toggle local inmediato, revert si error.
   */
  const handleSeguimiento = async () => {
    if (!seguimientoLocal) {
      return
    }

    setEnviando(true)
    setError(undefined)

    // Toggle usando método toggle() del value object (patrón funcional)
    const nuevoSeguimiento = seguimientoLocal.toggle()
    setSeguimientoLocal(nuevoSeguimiento)

    if (onSeguimiento) {
      try {
        await onSeguimiento(nuevoSeguimiento)
      } catch (err) {
        // Revert si falla (AC-04.4)
        setSeguimientoLocal(seguimiento)
        setError((err as any)?.message || 'Error al actualizar seguimiento')
      } finally {
        setEnviando(false)
      }
    } else {
      setEnviando(false)
    }
  }

  /**
   * T046: Handler para cargar más carpetas en modo consulta (sin acciones).
   * En perfil ajeno, solo permite visualización sin edición.
   */
  const handleCargarMasCarpetasAjeno = async (limit: number, offset: number) => {
    // En modo consulta, solo cargamos más carpetas para visualización
    // Sin acciones de edición
    setCargandoCarpetas(true)
    try {
      // TODO: Implementar llamada a carpetaService.listarCarpetas(usuarioId, limit, offset)
    } finally {
      setCargandoCarpetas(false)
    }
  }

  /**
   * T046: Handler para seleccionar una carpeta en modo ajeno.
   * Navega a la lista de posts de la carpeta (sin permisos de edición).
   */
  const handleSeleccionarCarpetaAjena = (carpeta: CarpetaPost) => {
    // Navegar a carpeta en modo lectura
    // TODO: Implementar navegación
    console.log('Ver carpeta ajena:', carpeta.nombre)
  }

  if (cargando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* AC-03.1: Encabezado de perfil ajeno con datos públicos */}
      <section
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Foto de perfil */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
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
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b7280' }}>
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
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '14px', color: '#6b7280' }}>
                {usuario.cantidadSeguidores} {usuario.cantidadSeguidores === 1 ? 'seguidor' : 'seguidores'}
              </p>
            </div>

            {/* Sobre mí */}
            {usuario.sobreMi && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{usuario.sobreMi}</p>
              </div>
            )}

            {/* Descripción */}
            {usuario.descripcion && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{usuario.descripcion}</p>
              </div>
            )}

            {/* AC-04.1 + A4: Botón de seguimiento toggle */}
            <div style={{ marginTop: '1rem' }}>
              {/* AC-03.4: NO mostrar acciones de edición (a diferencia de PerfilPropio) */}
              {/* AC-04.1: En perfil ajeno se muestra opción de seguir */}
              {seguimientoLocal && usuario.debeeMostrarBotonSeguir(usuarioActual.id) && (
                <div>
                  <button
                    onClick={handleSeguimiento}
                    disabled={enviando}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: seguimientoLocal.esSiguiendo() ? '#e5e7eb' : '#4f46e5',
                      color: seguimientoLocal.esSiguiendo() ? '#374151' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: enviando ? 'not-allowed' : 'pointer',
                      opacity: enviando ? 0.6 : 1,
                    }}
                  >
                    {/* A4: Toggle text based on state */}
                    {seguimientoLocal.getBotonTexto()}
                  </button>
                  {/* AC-04.4: Mostrar error si falla */}
                  {error && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#dc2626' }}>
                      {error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AC-03.5: Carpetas ajenas en modo consulta (T046: Integración de CarpetaList) */}
      <section style={{ marginBottom: '2rem' }}>
        <CarpetaList
          carpetas={carpetasActuales}
          esPerfilPropio={false}
          paginacion={paginacionCarpetas}
          cargando={cargandoCarpetas}
          onCargarMas={handleCargarMasCarpetasAjeno}
          onSelectCarpeta={handleSeleccionarCarpetaAjena}
        />
      </section>

      {/* AC-03.1 + AC-03.5: Publicaciones ajenas en modo lectura (T057: Integración con PublicacionList sin callbacks) */}
      <section>
        <PublicacionList
          publicaciones={publicacionesActuales}
          esPerfilPropio={false}
          cargando={cargandoPublicaciones}
        />
      </section>
    </div>
  )
}
