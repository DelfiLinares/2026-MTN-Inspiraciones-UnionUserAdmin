import React, { useState } from 'react'
import { Usuario } from '../../domain/Usuario'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { Publicacion } from '../../domain/Publicacion'
import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import { CarpetaList } from '../carpetas/CarpetaList'

/**
 * `PerfilAjeno`: Vista de perfil ajeno con opción de seguimiento (modo consulta).
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-03, HU-04, AC-03, AC-04, A4, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T021)
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
 * 5. Muestra publicaciones ajenas (AC-03.1):
 *    - En modo lectura (AC-13.3)
 *    - SIN opciones de editar/eliminar
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
  
  // T046: Estado para paginación de carpetas (modo consulta sin acciones)
  const [carpetasPaginadas, setCarpetasPaginadas] = useState<CarpetaPost[]>(carpetas)
  const [paginacionCarpetas, setPaginacionCarpetas] = useState<ResultadoCarpetasPaginado>({
    items: carpetas,
    total: carpetas.length,
    limit: 20,
    offset: 0,
    hasMore: false,
  })
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false)

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

    // Optimistic update: toggle state locally
    const seguimientoToggled = seguimientoLocal.toggle()
    setSeguimientoLocal(seguimientoToggled)

    try {
      // AC-04.5: No requiere confirmación explícita (ya estamos aquí sin confirm)
      if (onSeguimiento) {
        await onSeguimiento(seguimientoToggled)
      }
      // AC-04.3: State refleja nuevo estado tras éxito
    } catch (err) {
      // AC-04.4: Revert si falla
      setSeguimientoLocal(seguimiento)
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar seguimiento'
      setError(errorMsg)
    } finally {
      setEnviando(false)
    }
  }

  // T046: Callback para cargar más carpetas en perfil ajeno (paginación server-side, T045)
  // En modo consulta: sin acciones de crear, renombrar o eliminar
  const handleCargarMasCarpetasAjenas = async (limit: number, offset: number) => {
    setCargandoCarpetas(true)
    try {
      // T046: En esta iteración, se simula que todos los datos están ya cargados
      // En T046 futuro, aquí se haría la llamada al API con limit/offset
      // Por ahora, simplemente retornamos los datos actuales
      // TODO: Implementar llamada real al carpetaService.listarCarpetas(usuarioId, limit, offset)
      
      // Simulación: los datos están todos en carpetas[]
      const proximasPagina = carpetas.slice(offset, offset + limit)
      setCarpetasPaginadas([...carpetasPaginadas, ...proximasPagina])
      
      const nuevoOffset = offset + limit
      setPaginacionCarpetas({
        items: [...carpetasPaginadas, ...proximasPagina],
        total: carpetas.length,
        limit,
        offset: nuevoOffset,
        hasMore: nuevoOffset < carpetas.length,
      })
    } catch (err) {
      console.error('Error cargando más carpetas:', err)
    } finally {
      setCargandoCarpetas(false)
    }
  }

  // T046: Callback para seleccionar una carpeta (navegar a vista de posts de carpeta)
  const handleSeleccionarCarpetaAjena = (carpeta: CarpetaPost) => {
    // TODO: Implementar navegación a vista de carpeta con sus posts
    console.log('Carpeta seleccionada:', carpeta.nombre)
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

      {/* AC-03.5: Carpetas ajenas en modo consulta */}
      {/* T046: Integración de CarpetaList en perfil ajeno SIN acciones */}
      <CarpetaList
        carpetas={carpetasPaginadas}
        esPerfilPropio={false}
        paginacion={paginacionCarpetas}
        cargando={cargandoCarpetas}
        onCargarMas={handleCargarMasCarpetasAjenas}
        onSelectCarpeta={handleSeleccionarCarpetaAjena}
      />

      {/* AC-03.1 + AC-03.5: Publicaciones ajenas en modo lectura */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Publicaciones ({publicaciones.length})
        </h2>
        {publicaciones.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Este usuario aún no tiene publicaciones.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {publicaciones.map((publicacion) => (
              <div
                key={publicacion.id}
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {publicacion.imagenUrl && (
                  <img
                    src={publicacion.imagenUrl}
                    alt="publicación"
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '0.75rem' }}>
                  {publicacion.texto && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: '1.4' }}>
                      {publicacion.texto.substring(0, 60)}
                      {publicacion.texto.length > 60 ? '...' : ''}
                    </p>
                  )}
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(publicacion.fechaCreacion).toLocaleDateString()}
                  </p>
                  {/* AC-03.4: SIN acciones de edición/eliminación */}
                  {/* AC-13.3: Modo consulta */}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
