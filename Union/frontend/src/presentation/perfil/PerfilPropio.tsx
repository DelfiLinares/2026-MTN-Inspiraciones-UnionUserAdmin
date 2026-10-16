import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Usuario } from '../../domain/Usuario'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { Publicacion } from '../../domain/Publicacion'
import { ResultadoCarpetasPaginado } from '../../application/dto/ResultadoCarpetasPaginado'
import { EditarPerfilForm } from './EditarPerfilForm'
import { PhotoUploadField } from './PhotoUploadField'
import { CarpetaList } from '../carpetas/CarpetaList'
import { PublicacionList } from '../publicaciones/PublicacionList'

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
 *    - Lista de publicaciones (Publicacion[])
 *    - Componente PublicacionList con acciones de edición/eliminación (T053/T054)
 *    - Opción para guardar en carpeta (T055)
 *    - Callbacks para notificar cambios: onEditarExitosamente, onEliminarExitosamente, onGuardarEnCarpeta
 *    - Manejo de errores (A5: solo texto editable, A8: idempotencia)
 *    - T074: Estados de loading/empty/error (CB-18: mostrar vacío si sin publicaciones)
 *
 * 5. No ofrece botón de seguir (AC-01.5):
 *    - Regla explícita: debeeMostrarBotonSeguir() siempre false para perfil propio
 *
 * Props:
 * - `usuario: Usuario` — Objeto usuario autenticado con datos de perfil
 * - `carpetas?: CarpetaPost[]` — Carpetas públicas del usuario (opcional, para T020)
 * - `publicaciones?: Publicacion[]` — Publicaciones propias (opcional, para T020)
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
  publicaciones?: Publicacion[]
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
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false)

  // T074: Error states for carpetas and publicaciones
  const [errorCarpetas, setErrorCarpetas] = useState<string>('')

  // T057: Estado para publicaciones propias
  const [publicacionesActuales, setPublicacionesActuales] = useState(publicaciones)
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(false)

  // T074: Error states for publicaciones
  const [errorPublicaciones, setErrorPublicaciones] = useState<string>('')

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
    // En T045, onCargarMas recibe limit y offset
    // Aquí simulamos que el padre (quien usa PerfilPropio) carga más carpetas
    // Por ahora, no hacemos nada especial ya que las carpetas vienen como prop
    // En una integración completa, esto llamaría a un servicio
    setCargandoCarpetas(true)
    try {
      // TODO: Implementar llamada a carpetaService.listarCarpetas(usuarioId, limit, offset)
      // Por ahora, asumimos que no hay más carpetas (hasMore = false)
    } finally {
      setCargandoCarpetas(false)
    }
  }

  const handleCrearCarpeta = () => {
    // T042: Al crear carpeta, recargamos la lista desde el padre
    // El callback onCreate de CarpetaList invocará esto
    // Aquí podríamos recargar la lista o esperar que el padre (router) se refresque
    console.log('Carpeta creada. Recargando lista...')
    // TODO: Implementar recarga de carpetas desde el servicio
  }

  const handleRenombrarCarpeta = (carpetaRenombrada: CarpetaPost) => {
    // T043: Actualizar la carpeta en la lista local
    setCarpetasActuales((prev) =>
      prev.map((c) => (c.id === carpetaRenombrada.id ? carpetaRenombrada : c))
    )
    console.log('Carpeta renombrada:', carpetaRenombrada.nombre)
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
    console.log('Carpeta eliminada:', carpetaEliminada.nombre)
  }

  const handleSeleccionarCarpeta = (carpeta: CarpetaPost) => {
    // HU-10: Navegar a la lista de posts de la carpeta
    navigate(`/carpeta/${carpeta.id}`)
  }

  // T057: Handlers para gestión de publicaciones propias
  const handleEditarPublicacionExitosamente = (publicacionEditada: Publicacion) => {
    // HU-11: Actualizar publicación en la lista tras edición exitosa
    setPublicacionesActuales((prev) =>
      prev.map((p) => (p.id === publicacionEditada.id ? publicacionEditada : p))
    )
  }

  const handleEliminarPublicacionExitosamente = (publicacionId: string) => {
    // HU-12: Remover publicación de la lista tras eliminación exitosa
    setPublicacionesActuales((prev) => prev.filter((p) => p.id !== publicacionId))
  }

  const handleGuardarPublicacionEnCarpeta = (publicacionGuardada: Publicacion) => {
    // HU-09: Notificar que la publicación se guardó en carpeta
    // No modificamos la lista de publicaciones propias (la publicación sigue siendo propia)
    // Solo notificamos el evento; el padre podría actualizar carpetas si lo desea
    console.log('Publicación guardada en carpeta:', publicacionGuardada.id)
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
                  backgroundColor: '#4f46e5',
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
        ) : carpetasActuales.length === 0 ? (
          // CB-17: Empty state when no carpetas
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
              No hay carpetas aún
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
              Crea una carpeta para organizar tus posts guardados
            </p>
          </div>
        ) : (
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
          />
        )}
      </section>

      {/* AC-01.3: Publicaciones propias del usuario (T057: Integración con PublicacionList y callbacks) */}
      {/* T074: Estados de loading/empty/error para publicaciones */}
      <section>
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
            esPerfilPropio={true}
            cargando={cargandoPublicaciones}
            onEditarExitosamente={handleEditarPublicacionExitosamente}
            onEliminarExitosamente={handleEliminarPublicacionExitosamente}
            onGuardarEnCarpeta={handleGuardarPublicacionEnCarpeta}
          />
        )}
      </section>

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
