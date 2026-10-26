/**
 * Adaptador de `SesionUsuarioPort` para el módulo 007 (T061).
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/plan.md (puertos adicionales; tabla de errores: 401)
 * - Union/specs/007-inspiraciones-busqueda/spec.md (A-16, RF-25)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T061)
 * - Union/specs/001-plataforma-unificada/plan.md (`RutaProtegida` como referencia de redirección)
 *
 * Ante un 401 hace `authService.logout()` (limpia el token local) y después redirige a `/login`.
 * No usa `sessionGuard`, que es de administración.
 *
 * La redirección es una navegación completa y no un `navigate` de React Router: `AuthContext`
 * guarda el usuario en memoria y `authService.logout()` no lo actualiza, así que una navegación
 * interna dejaría la app con una sesión obsoleta. Cargar `/login` de nuevo reinicia el contexto
 * desde el estado real.
 */

import type { SesionUsuarioPort } from '../../application/busqueda/SesionUsuarioPort'
import { authService } from '../../services/authService'

export interface OpcionesSesionUsuarioAdapter {
  /** Por defecto, `authService.logout()`. */
  readonly cerrarSesion?: () => Promise<void>
  /** Por defecto, carga `/login`. */
  readonly redirigirALogin?: () => void
}

const redirigirALoginPorDefecto = () => window.location.replace('/login')

export function crearSesionUsuarioAdapter(
  opciones: OpcionesSesionUsuarioAdapter = {},
): SesionUsuarioPort {
  const cerrarSesion = opciones.cerrarSesion ?? (() => authService.logout())
  const redirigirALogin = opciones.redirigirALogin ?? redirigirALoginPorDefecto
  return {
    alNoAutenticado() {
      // Se espera al cierre antes de navegar para no cortar la petición de logout en vuelo.
      // Un fallo del cierre no impide redirigir, y no debe quedar como promesa rechazada.
      void cerrarSesion().catch(() => undefined).finally(redirigirALogin)
    },
  }
}
