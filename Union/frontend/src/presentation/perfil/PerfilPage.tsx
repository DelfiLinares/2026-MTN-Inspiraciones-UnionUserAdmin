import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { Usuario } from '../../domain/Usuario'
import { EstadoCuentaUsuario } from '../../domain/enums/EstadoCuentaUsuario'
import { PerfilPropio } from './PerfilPropio'
import { PerfilAjeno } from './PerfilAjeno'
import { ProfileNotFoundView } from './ProfileNotFoundView'

/**
 * `PerfilPage`: Contenedor root que decide entre perfil propio y ajeno.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T019)
 *
 * Responsabilidades:
 * 1. Extrae parámetro `:id` de la ruta (React Router).
 *    - Si no existe: Perfil propio del usuario autenticado (ruta `/perfil`)
 *    - Si existe: Perfil ajeno del usuario con ese ID (ruta `/perfil/:id`)
 *
 * 2. Gestiona el estado de carga y errores:
 *    - Obtiene datos del usuario desde PerfilService (T029).
 *    - Valida disponibilidad de cuenta (A10: solo ACTIVO visible para terceros).
 *    - Si BANEADO/ELIMINADO: Muestra vista de no disponible (ProfileNotFoundView, T027).
 *    - Si error de carga: Muestra mensaje de error genérico.
 *
 * 3. Renderiza subcomponentes según contexto:
 *    - PerfilPropio.tsx (T020): Perfil propio con acciones de edición.
 *    - PerfilAjeno.tsx (T021): Perfil ajeno con opción de seguir.
 *    - ProfileNotFoundView.tsx (T027): Perfil no disponible.
 *
 * Rutas:
 * - GET `/perfil` → Perfil propio (usuarioActualId se obtiene de AuthContext)
 * - GET `/perfil/:id` → Perfil ajeno (usuarioId = params.id)
 *
 * Historias de usuario:
 * - HU-01: Visualizar perfil propio
 * - HU-02: Editar perfil propio
 * - HU-03: Visualizar perfil ajeno (con A10: solo si está ACTIVO)
 *
 * Reglas:
 * - A10 (Clarificación): Perfil BANEADO/ELIMINADO no es visible a terceros.
 *       Respuesta backend: 404/403 en obtenerPerfil; el frontend lo trata como ProfileNotFoundView.
 * - Rol-agnóstico: Ambos USER y ADMIN ven el mismo contenido (Principio VI).
 */

interface PerfilPageState {
  cargando: boolean
  error?: string
  usuario?: Usuario
}

export const PerfilPage: React.FC = () => {
  const { id: usuarioIdParam } = useParams<{ id?: string }>()
  const { usuario: usuarioActual, cargando: cargandoAuth } = useAuth()
  const navigate = useNavigate()

  const [state, setState] = useState<PerfilPageState>({ cargando: true })

  /**
   * Efecto: Determina si es perfil propio o ajeno y carga datos.
   * - Si `usuarioIdParam` no existe: Perfil propio (id = usuarioActual.id)
   * - Si `usuarioIdParam` existe: Perfil ajeno (id = usuarioIdParam)
   */
  useEffect(() => {
    if (cargandoAuth) {
      return // Esperar a que se resuelva la autenticación
    }

    if (!usuarioActual) {
      // No debería ocurrir (RutaProtegida debería haberlo validado), pero por seguridad:
      navigate('/login', { replace: true })
      return
    }

    const usuarioIdACargar = usuarioIdParam || usuarioActual.id
    const esPerfilPropio = !usuarioIdParam

    // TODO (T029): Implementar PerfilService.obtenerPerfil(usuarioIdACargar)
    // Por ahora, placeholder que simula la carga.
    setState({
      cargando: true,
      error: undefined,
      usuario: undefined,
    })

    // Simulación de carga de usuario
    const cargarUsuario = async () => {
      try {
        // await perfilService.obtenerPerfil(usuarioIdACargar)
        // Para esta iteración (T019), usamos el usuario actual si es perfil propio
        if (esPerfilPropio) {
          // El usuario actual viene del AuthContext (T029 lo refinará con PerfilService)
          setState({
            cargando: false,
            error: undefined,
            usuario: usuarioActual,
          })
        } else {
          // Perfil ajeno: Requiere PerfilService (T029)
          // Por ahora, mostrar placeholder
          setState({
            cargando: false,
            error: 'Perfil ajeno requiere T029 (PerfilService)',
            usuario: undefined,
          })
        }
      } catch (err) {
        // Manejo de errores HTTP (404/403 para A10)
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar perfil'
        setState({
          cargando: false,
          error: errorMsg,
          usuario: undefined,
        })
      }
    }

    cargarUsuario()
  }, [usuarioIdParam, usuarioActual, cargandoAuth, navigate])

  // Mostrar loading mientras se cargan datos de autenticación
  if (cargandoAuth || state.cargando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  // Mostrar error si ocurrió durante la carga
  if (state.error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <p>Error: {state.error}</p>
      </div>
    )
  }

  // Validar que se cargó el usuario
  if (!state.usuario) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>No se pudo cargar el usuario.</p>
      </div>
    )
  }

  // A10: Si perfil ajeno y no está disponible, mostrar ProfileNotFoundView
  const usuarioIdParam_ = usuarioIdParam
  const esPerfilPropio = !usuarioIdParam_
  if (!esPerfilPropio && !state.usuario.estaDisponible()) {
    // T027: ProfileNotFoundView maneja BANEADO/ELIMINADO
    return (
      <ProfileNotFoundView
        usuario={state.usuario}
        onVolver={() => navigate(-1)}
      />
    )
  }

  // Renderizar perfil propio o ajeno
  if (esPerfilPropio) {
    // T020: PerfilPropio con acciones de edición y datos del usuario
    return (
      <PerfilPropio
        usuario={state.usuario}
        onEditarPerfil={() => {
          // TODO (T032): Integrar edición de perfil
          console.log('Abrir formulario de edición')
        }}
        onCambiarFoto={() => {
          // TODO (T032): Integrar cambio de foto
          console.log('Abrir diálogo de cambio de foto')
        }}
      />
    )
  } else {
    // T021: PerfilAjeno con opción de seguimiento
    return (
      <PerfilAjeno
        usuario={state.usuario}
        usuarioActual={usuarioActual!}
        onSeguimiento={async (seguimiento) => {
          // TODO (T030): Integrar servicio de seguimiento
          console.log('Toggling seguimiento:', seguimiento)
        }}
      />
    )
  }
}
