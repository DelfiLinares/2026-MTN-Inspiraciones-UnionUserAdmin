/**
 * Puerto de sesión de usuario del módulo 007 (T060).
 *
 * La UI no importa `authService`, `AuthContext` ni `sessionGuard`: ante un 401 llama a
 * `alNoAutenticado`, y la implementación (`SesionUsuarioAdapter`, T061) cierra la sesión local
 * y redirige a `/login`.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/plan.md (tabla de errores: 401; puertos adicionales)
 * - Union/specs/007-inspiraciones-busqueda/spec.md (A-16, RF-18, RF-25)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T060)
 */
export interface SesionUsuarioPort {
  /** Ante un 401: cierra la sesión local y lleva a `/login`. */
  alNoAutenticado(): void
}
