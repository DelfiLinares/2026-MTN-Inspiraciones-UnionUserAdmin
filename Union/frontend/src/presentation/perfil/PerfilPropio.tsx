import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsuarioPerfil as Usuario } from '../../domain/UsuarioPerfil'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import type { ResultadoPublicacionesPaginado } from '../../application/ports/PublicacionRepository'
import { carpetaService } from '../../services/carpetaPerfilService'
import { publicacionService } from '../../services/perfilPublicacionService'
import {
  obtenerCatalogoOnboarding,
  obtenerMisInteresesOnboarding,
} from '../../services/onboardingInteresesService'
import { EditarPerfilForm } from './EditarPerfilForm'
import { PhotoUploadField } from './PhotoUploadField'
import { CarpetaList } from '../carpetas/CarpetaList'
import { PublicacionList } from '../publicaciones/PublicacionList'
import { CrearPublicacionDialog } from '../publicaciones/CrearPublicacionDialog'

const TAMANIO_PAGINA = 20

/**
 * `PerfilPropio`: Vista de perfil propio con acciones de edición.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-11, HU-12, HU-13, AC-01, AC-02, A5, A8, CB-17, CB-18)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T020, T034, T057, T074)
 *
 * Responsabilidades:
 * 1. Muestra encabezado del perfil (AC-01.1):
 *    - Foto de perfil
 *    - Nombre de usuario
 *    - "Sobre mí" (sobreMi, ≤80 chars)
 *    - Descripción (≤200 chars)
 *    - Cantidad de seguidores
 *
 * 2. Ofrece acciones del perfil propio (AC-01.4, T034):
 *    - Botón "Editar perfil" (abre modal con EditarPerfilForm, T032)
 *    - Botón "Cambiar foto" (abre modal con PhotoUploadField, T033)
 *
 * 3. Muestra carpetas públicas del usuario (AC-01.2):
 *    - Lista de carpetas (CarpetaPost[])
 *    - Acciones de gestión: crear, renombrar, eliminar (T024–T026)
 *    - T074: Estados de loading/empty/error (CB-17: mostrar vacío si sin carpetas)
 *
 * 4. Muestra publicaciones propias del usuario (AC-01.3, HU-11/12/13, T057):
 *    - Lista de publicaciones (PublicacionPerfil[])
 *    - Componente PublicacionList con acciones de edición/eliminación (T053/T054)
 *    - Opción para guardar en carpeta (T055)
 *    - Callbacks para notificar cambios: onEditarExitosamente, onEliminarExitosamente, onGuardarEnCarpeta
 *    - Manejo de errores (A5: solo texto editable, A8: idempotencia)
 *    - T074: Estados de loading/empty/error (CB-18: mostrar vacío si sin publicaciones)
 *
 * 5. No ofrece botón de seguir (AC-01.5):
 *    - Regla explícita: debeMostrarBotonSeguir() siempre false para perfil propio
 *
 * Props:
 * - `usuario: Usuario` — Objeto usuario autenticado con datos de perfil
 * - `carpetas?: CarpetaPost[]` — Carpetas públicas del usuario (opcional, para T020)
 * - `publicaciones?: PublicacionPerfil[]` — Publicaciones propias (opcional, para T020)
 * - `cargando?: boolean` — true si se están cargando datos (opcional, para skeleton)
 * - `onPerfilActualizado?: (usuario: Usuario) => void` — Callback después de actualizar (T034)
 *
 * Historias de usuario:
 * - HU-01: Visualizar perfil propio (estructura base)
 * - HU-02: Editar perfil propio (botones y acciones)
 * - HU-11: Editar publicación propia (integración con EditPostForm, T053)
 * - HU-12: Eliminar publicación propia (integración con ConfirmDeletePostDialog, T054)
 * - HU-13: Visualizar publicaciones del perfil (integración con PublicacionList, T057)
 *
 * Clarificaciones:
 * - A1: Username validación
 * - A2: Foto de perfil restricciones
 * - A5: Solo texto editable en publicaciones (imagen inmutable)
 * - A8: Idempotencia en guardado a carpeta (200 vs 201)
 * - CB-17: Perfil sin carpetas → estado vacío
 * - CB-18: Perfil sin publicaciones → estado vacío
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo contenido (Principio VI)
 * - La gestión de carpetas y publicaciones depende de T024–T026, T053–T055
 * - El formulario de edición es T022 (EditarPerfilForm.tsx)
 * - La subida de foto es T023 (PhotoUploadField.tsx)
 * - T034: Integración de modal de edición con EditarPerfilForm y PhotoUploadField
 * - T057: Integración de lista de publicaciones con acciones (editar, eliminar, guardar en carpeta)
 * - T074: Estados loading/empty/error en carpetas y publicaciones (CB-17, CB-18)
 */

export interface PerfilPropioProps {
  usuario: Usuario
  carpetas?: CarpetaPost[]
  publicaciones?: PublicacionPerfil[]
  cargando?: boolean
  onPerfilActualizado?: (usuario: Usuario) => void
}

export const PerfilPropio: React.FC<PerfilPropioProps> = ({
  usuario,
  carpetas = [],
  publicaciones = [],
  cargando = false,
  onPerfilActualizado,
}) => {
  const navigate = useNavigate()
  const [mostrarAcciones, setMostrarAcciones] = useState(false)

  // T034: Estado para modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalFoto, setMostrarModalFoto] = useState(false)
  const [usuarioActualizado, setUsuarioActualizado] = useState(usuario)
  const [categoriasFavoritas, setCategoriasFavoritas] = useState<string[]>([])
  const [cargandoCategoriasFavoritas, setCargandoCategoriasFavoritas] = useState(true)
  const [errorCategoriasFavoritas, setErrorCategoriasFavoritas] = useState('')

  // T046: Estado para carpetas y paginación
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

  // T074: Error states for carpetas and publicaciones
  const [errorCarpetas, setErrorCarpetas] = useState<string>('')

  // T057: Estado para publicaciones propias
  const [publicacionesActuales, setPublicacionesActuales] = useState(publicaciones)
  const [paginacionPublicaciones, setPaginacionPublicaciones] =
    useState<ResultadoPublicacionesPaginado>()
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(true)
  const [cargandoMasPublicaciones, setCargandoMasPublicaciones] = useState(false)
  const [mostrarCrearPublicacion, setMostrarCrearPublicacion] = useState(false)

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
          usuarioActualizado.id,
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
    [usuarioActualizado.id],
  )

  const cargarPublicaciones = useCallback(
    async (limit: number, offset: number, anexar: boolean) => {
      if (!anexar) {
        setCargandoPublicaciones(true)
      }
      setErrorPublicaciones('')
      try {
        const resultado = await publicacionService.listarPublicaciones(
          usuarioActualizado.id,
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
    [usuarioActualizado.id],
  )

  useEffect(() => {
    setCarpetasActuales([])
    setPublicacionesActuales([])
    setPaginacionCarpetas(undefined)
    setPaginacionPublicaciones(undefined)
    void cargarCarpetas(TAMANIO_PAGINA, 0, false).catch(() => undefined)
    void cargarPublicaciones(TAMANIO_PAGINA, 0, false)
  }, [cargarCarpetas, cargarPublicaciones])

  useEffect(() => {
    const controller = new AbortController()
    let activo = true

    Promise.all([
      obtenerCatalogoOnboarding({ signal: controller.signal }),
      obtenerMisInteresesOnboarding({ signal: controller.signal }),
    ])
      .then(([catalogo, intereses]) => {
        if (!activo) {
          return
        }

        const seleccionadas = new Set([
          ...intereses.generoIds,
          ...intereses.estiloIds,
          ...intereses.tipoMusicaIds,
        ])
        setCategoriasFavoritas(
          [...catalogo.generos, ...catalogo.estilos, ...catalogo.tiposMusica]
            .filter((categoria) => seleccionadas.has(categoria.codigo))
            .map((categoria) => categoria.nombre),
        )
      })
      .catch(() => {
        if (activo) {
          setErrorCategoriasFavoritas('No se pudieron cargar tus categorías favoritas.')
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoCategoriasFavoritas(false)
        }
      })

    return () => {
      activo = false
      controller.abort()
    }
  }, [])

  const handleEditarPerfil = () => {
    setMostrarModalEditar(true)
  }

  const handleCambiarFoto = () => {
    setMostrarModalFoto(true)
  }

  const handleCerrarModal = () => {
    setMostrarModalEditar(false)
    setMostrarModalFoto(false)
  }

  // T034: Callback cuando se actualiza el perfil
  const handlePerfilActualizado = (usuarioActual: Usuario) => {
    setUsuarioActualizado(usuarioActual)
    setMostrarModalEditar(false)
    if (onPerfilActualizado) {
      onPerfilActualizado(usuarioActual)
    }
  }

  // T033: Callback cuando se actualiza la foto
  const handleFotoActualizada = (usuarioActual: Usuario) => {
    setUsuarioActualizado(usuarioActual)
    setMostrarModalFoto(false)
    if (onPerfilActualizado) {
      onPerfilActualizado(usuarioActual)
    }
  }

  // T046: Handlers para gestión de carpetas
  const handleCargarMasCarpetas = async (limit: number, offset: number) => {
    await cargarCarpetas(limit, offset, true)
  }

  const handleCrearCarpeta = () => {
    void cargarCarpetas(TAMANIO_PAGINA, 0, false).catch(() => undefined)
  }

  const handleRenombrarCarpeta = (carpetaRenombrada: CarpetaPost) => {
    // T043: Actualizar la carpeta en la lista local
    setCarpetasActuales((prev) =>
      prev.map((c) => (c.id === carpetaRenombrada.id ? carpetaRenombrada : c))
    )
  }

  const handleEliminarCarpeta = (carpetaEliminada: CarpetaPost) => {
    // T044: Remover la carpeta de la lista y actualizar paginación
    setCarpetasActuales((prev) => prev.filter((c) => c.id !== carpetaEliminada.id))
    if (paginacionCarpetas) {
      setPaginacionCarpetas((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((c) => c.id !== carpetaEliminada.id),
              total: Math.max(0, prev.total - 1),
            }
          : prev
      )
    }
  }

  const handleSeleccionarCarpeta = (carpeta: CarpetaPost) => {
    navigate(`/carpeta/${encodeURIComponent(carpeta.id)}`)
  }

  // T057: Handlers para gestión de publicaciones propias
  const handleEditarPublicacionExitosamente = (publicacionEditada: PublicacionPerfil) => {
    // HU-11: Actualizar publicación en la lista tras edición exitosa
    setPublicacionesActuales((prev) =>
      prev.map((p) => (p.id === publicacionEditada.id ? publicacionEditada : p))
    )
  }

  const handleEliminarPublicacionExitosamente = (publicacionId: string) => {
    // HU-12: Remover publicación de la lista tras eliminación exitosa
    setPublicacionesActuales((prev) => prev.filter((p) => p.id !== publicacionId))
  }

  const handleGuardarPublicacionEnCarpeta = () => {
    void cargarCarpetas(TAMANIO_PAGINA, 0, false).catch(() => undefined)
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
        <p>Cargando perfil propio...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* AC-01.1: Encabezado de perfil con datos personales */}
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
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            onMouseEnter={() => setMostrarAcciones(true)}
            onMouseLeave={() => setMostrarAcciones(false)}
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
            {mostrarAcciones && (
              <button
                onClick={handleCambiarFoto}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Cambiar
              </button>
            )}
          </div>

          {/* Datos personales */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '20px', fontWeight: '700' }}>
                @{usuario.username}
              </h1>
              <div
                role="group"
                aria-label="Categorías favoritas"
                style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}
              >
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Favoritas:</span>
                {cargandoCategoriasFavoritas ? (
                  <span role="status" style={{ fontSize: '12px', color: '#6b7280' }}>
                    Cargando...
                  </span>
                ) : errorCategoriasFavoritas ? (
                  <span role="alert" style={{ fontSize: '12px', color: '#6b7280' }}>
                    {errorCategoriasFavoritas}
                  </span>
                ) : categoriasFavoritas.length > 0 ? (
                  categoriasFavoritas.map((categoria) => (
                    <span
                      key={categoria}
                      style={{
                        padding: '0.2rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '999px',
                        color: '#374151',
                        fontSize: '12px',
                      }}
                    >
                      {categoria}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Sin categorías favoritas
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/cuestionario')}
                  style={{
                    padding: '0.3rem 0.6rem',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cambiar categorías
                </button>
              </div>
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

            {/* AC-01.4: Botones de acción para perfil propio */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={handleEditarPerfil}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Editar perfil
              </button>
              {/* AC-01.5: NO mostrar botón de seguir en perfil propio */}
            </div>
          </div>
        </div>
      </section>

      {/* AC-01.2: Carpetas públicas del usuario (T046: Integración de CarpetaList) */}
      {/* T074: Estados de loading/empty/error para carpetas */}
      <section style={{ marginBottom: '2rem' }}>
        {errorCarpetas && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
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
        ) : (
          // CB-17: CarpetaList muestra su propio estado vacío y el botón de crear
          <CarpetaList
            carpetas={carpetasActuales}
            esPerfilPropio={true}
            paginacion={paginacionCarpetas}
            cargando={cargandoCarpetas}
            onCargarMas={handleCargarMasCarpetas}
            onCreate={handleCrearCarpeta}
            onRename={handleRenombrarCarpeta}
            onDelete={handleEliminarCarpeta}
            onSelectCarpeta={handleSeleccionarCarpeta}
            onManageCarpetaPublicaciones={() => {
              void cargarCarpetas(TAMANIO_PAGINA, 0, false).catch(
                () => undefined,
              )
            }}
          />
        )}
      </section>

      {/* AC-01.3: Publicaciones propias del usuario (T057: Integración con PublicacionList y callbacks) */}
      {/* T074: Estados de loading/empty/error para publicaciones */}
      <section>
        <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Publicaciones
            </h2>
            <button
              type="button"
              onClick={() => setMostrarCrearPublicacion(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + Nueva publicación
            </button>
          </div>
        {errorPublicaciones && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
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
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              color: '#6b7280',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '15px', fontWeight: '500' }}>
              No hay publicaciones aún
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
              Comparte tu primer post para que otros puedan verlo
            </p>
          </div>
        ) : (
          <PublicacionList
            publicaciones={publicacionesActuales}
            paginacion={paginacionPublicaciones}
            esPerfilPropio={true}
            usuarioActualId={usuarioActualizado.id}
            onEditar={() => undefined}
            onEliminar={() => undefined}
            onCargarMas={handleCargarMasPublicaciones}
            cargando={cargandoPublicaciones}
            cargandoMas={cargandoMasPublicaciones}
            onGuardarEnCarpeta={handleGuardarPublicacionEnCarpeta}
            onEditarExitosamente={handleEditarPublicacionExitosamente}
            onEliminarExitosamente={handleEliminarPublicacionExitosamente}
          />
        )}
      </section>

      {mostrarCrearPublicacion && (
        <CrearPublicacionDialog
          onSuccess={() => {
            setMostrarCrearPublicacion(false)
            void cargarPublicaciones(TAMANIO_PAGINA, 0, false)
          }}
          onCancel={() => setMostrarCrearPublicacion(false)}
        />
      )}

      {/* T034: Modal de edición de perfil con EditarPerfilForm integrado */}
      {mostrarModalEditar && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 'auto',
            }}
          >
            <EditarPerfilForm
              usuario={usuarioActualizado}
              onCancel={handleCerrarModal}
              onPerfilActualizado={handlePerfilActualizado}
            />
          </div>
        </div>
      )}

      {/* T033: Modal de cambio de foto con PhotoUploadField integrado */}
      {mostrarModalFoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              width: '90%',
              padding: '2rem',
            }}
          >
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
              Cambiar foto de perfil
            </h2>
            <PhotoUploadField fotoActual={usuarioActualizado.foto} onFotoActualizada={handleFotoActualizada} />
            <button
              onClick={handleCerrarModal}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
