import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Usuario } from '../../domain/Usuario'
import { CarpetaPost } from '../../domain/CarpetaPost'
import { Publicacion } from '../../domain/Publicacion'
import { EditarPerfilForm } from './EditarPerfilForm'
import { PhotoUploadField } from './PhotoUploadField'

/**
 * `PerfilPropio`: Vista de perfil propio con acciones de edición.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, AC-01, AC-02)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T020, T034)
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
 *    - Placeholder para component CarpetaCard (T030)
 *    - Acciones de gestión: crear, renombrar, eliminar (T024–T026)
 *
 * 4. Muestra publicaciones propias del usuario (AC-01.3):
 *    - Lista de publicaciones (Publicacion[])
 *    - Placeholder para component PublicacionCard (T031)
 *    - Acciones de gestión: editar, eliminar (T032–T033)
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
 *
 * Clarificaciones:
 * - A1: Username validación
 * - A2: Foto de perfil restricciones
 *
 * Notas:
 * - Rol-agnóstico: USER y ADMIN ven el mismo contenido (Principio VI)
 * - La gestión de carpetas y publicaciones depende de T024–T026, T032–T033
 * - El formulario de edición es T022 (EditarPerfilForm.tsx)
 * - La subida de foto es T023 (PhotoUploadField.tsx)
 * - T034: Integración de modal de edición con EditarPerfilForm y PhotoUploadField
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

      {/* AC-01.2: Carpetas públicas del usuario */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Carpetas ({carpetas.length})
        </h2>
        {carpetas.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Aún no tienes carpetas. Crea una para organizar tus publicaciones.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            {carpetas.map((carpeta) => (
              <div
                key={carpeta.id}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                  {carpeta.nombre}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                  {carpeta.postCount} post{carpeta.postCount !== 1 ? 's' : ''}
                </p>
                {/* TODO (T024–T026): Acciones de gestión de carpetas */}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AC-01.3: Publicaciones propias del usuario */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Mis publicaciones ({publicaciones.length})
        </h2>
        {publicaciones.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Aún no tienes publicaciones. Crea una para compartir con la comunidad.
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
                  {/* TODO (T032–T033): Acciones de gestión de publicaciones */}
                </div>
              </div>
            ))}
          </div>
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
