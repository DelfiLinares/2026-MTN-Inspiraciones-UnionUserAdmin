import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { Usuario } from '../../domain/Usuario'
import { EstadoCuentaUsuario } from '../../domain/enums/EstadoCuentaUsuario'
import { PerfilPropio } from './PerfilPropio'
import { PerfilAjeno } from './PerfilAjeno'
import { ProfileNotFoundView } from './ProfileNotFoundView'
import { usuarioPerfilService } from '../../services/perfilService'

/**
 * `PerfilPage`: Contenedor root que decide entre perfil propio y ajeno.
 *
 * Fuentes de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección "Project Structure", perfil/)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T019, T035)
 *
 * Responsabilidades:
 * 1. Extrae parámetro `:id` de la ruta (React Router).
 *    - Si no existe: Perfil propio del usuario autenticado (ruta `/perfil`)
 *    - Si existe: Perfil ajeno del usuario con ese ID (ruta `/perfil/:id`)
 *
 * 2. Gestiona el estado de carga y errores (T035):
 *    - Obtiene datos del usuario desde PerfilService (T029, T030, T031).
 *    - Valida disponibilidad de cuenta (A10: solo ACTIVO visible para terceros).
 *    - Si BANEADO/ELIMINADO: Muestra vista de no disponible (ProfileNotFoundView, T027).
 *    - Si error 404/403 en backend: Trata como perfil no disponible (A10, T035).
 *    - Si error de carga: Muestra mensaje de error genérico.
 *
 * 3. Renderiza subcomponentes según contexto:
 *    - PerfilPropio.tsx (T020): Perfil propio con acciones de edición.
 *    - PerfilAjeno.tsx (T021): Perfil ajeno con opción de seguir.
 *    - ProfileNotFoundView.tsx (T027): Perfil no disponible (A10, T035).
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
 *       Respuesta backend: 404/403 en obtenerPerfil; el frontend lo trata como ProfileNotFoundView (T035).
 * - Rol-agnóstico: Ambos USER y ADMIN ven el mismo contenido (Principio VI).
 * - T035: Guardas de visualización por estado de cuenta (404/403 → ProfileNotFoundView)
 */

interface PerfilPageState {
  cargando: boolean
  error?: string
  usuario?: Usuario
  es403O404?: boolean // T035: Indicador de error 404/403 (perfil no disponible)
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
   * T035: Maneja errores 404/403 derivando a ProfileNotFoundView
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

    setState({
      cargando: true,
      error: undefined,
      usuario: undefined,
      es403O404: false,
    })

    const cargarUsuario = async () => {
      try {
        // T035: Usar UsuarioPerfilService para cargar el perfil
        // Maneja tanto perfil propio como ajeno, con validaciones de A10
        let usuario: Usuario

        if (esPerfilPropio) {
          // HU-01: Obtener perfil propio
          usuario = await usuarioPerfilService.obtenerPerfilPropio()
        } else {
          // HU-03: Obtener perfil ajeno (con validación A10)
          usuario = await usuarioPerfilService.obtenerPerfilAjeno(usuarioIdACargar)
        }

        setState({
          cargando: false,
          error: undefined,
          usuario,
          es403O404: false,
        })
      } catch (err) {
        // T035: Manejo de errores HTTP (404/403 para A10)
        const errorMsg = err instanceof Error ? err.message : 'Error al cargar perfil'

        // Detectar si es error 404/403 por estado de cuenta (A10)
        const es403O404 = errorMsg.includes('no disponible') || 
                         errorMsg.includes('no existe') ||
                         errorMsg.includes('no está disponible')

        setState({
          cargando: false,
          error: errorMsg,
          usuario: undefined,
          es403O404,
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

  // T035: Si error 404/403, mostrar ProfileNotFoundView
  if (state.es403O404 && !state.usuario) {
    return (
      <ProfileNotFoundView
        usuario={undefined} // No tenemos datos del usuario, pero es por estar no disponible
        onVolver={() => navigate(-1)}
      />
    )
  }

  // Mostrar error si ocurrió durante la carga (y no es 404/403)
  if (state.error && !state.es403O404) {
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

  // A10: Validación adicional client-side (respaldo de T035)
  // Si perfil ajeno y no está disponible, mostrar ProfileNotFoundView
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
    // T034: Modales integrados de edición y cambio de foto
    return (
      <PerfilPropio
        usuario={state.usuario}
        onPerfilActualizado={(usuarioActualizado) => {
          // T034: Actualizar usuario en estado
          setState((prev) => ({
            ...prev,
            usuario: usuarioActualizado,
          }))
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
