import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'
import { authService } from './authService'

/**
 * Contexto de autenticación y sesión (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-05, RF-06, RF-77, RF-78)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T047, T069)
 *
 * Responsabilidades:
 * - Expone `usuario`, `rol`, `cargando`, `estaAutenticado`.
 * - Permite ejecutar `iniciarSesion`, `cerrarSesion` y recargar la sesión desde `authService`.
 * - Valida en el frontend que roles no compatibles (como ADMIN) no operen como usuario común (RF-78).
 */

export interface AuthContextValue {
  /** Usuario autenticado o null si no hay sesión activa */
  usuario: Usuario | null
  /** Rol del usuario autenticado o null */
  rol: RolUsuario | string | null
  /** true mientras se verifica la sesión inicial */
  cargando: boolean
  /** true si el usuario está autenticado */
  estaAutenticado: boolean
  /** Establece el usuario tras login o registro */
  iniciarSesion: (usuario: Usuario) => void
  /** Cierra la sesión activa */
  cerrarSesion: () => Promise<void>
  /** Revalida la sesión actual contra el backend */
  revalidarSesion: () => Promise<Usuario | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  const revalidarSesion = useCallback(async (): Promise<Usuario | null> => {
    try {
      const usuarioActual = await authService.verificarSesionActual()
      setUsuario(usuarioActual)
      return usuarioActual
    } catch {
      setUsuario(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    authService
      .verificarSesionActual()
      .then((usuarioActual) => {
        if (!cancelado) {
          setUsuario(usuarioActual)
        }
      })
      .catch(() => {
        if (!cancelado) {
          setUsuario(null)
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  const iniciarSesion = useCallback((nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario)
  }, [])

  const cerrarSesion = useCallback(async () => {
    await authService.logout()
    setUsuario(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      rol: usuario?.rol ?? null,
      cargando,
      estaAutenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
      revalidarSesion,
    }),
    [usuario, cargando, iniciarSesion, cerrarSesion, revalidarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para consumir el estado de autenticación de usuario.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
