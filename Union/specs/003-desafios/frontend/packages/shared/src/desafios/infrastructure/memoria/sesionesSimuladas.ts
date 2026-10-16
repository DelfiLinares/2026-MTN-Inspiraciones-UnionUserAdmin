/**
 * Sesiones simuladas para el adaptador en memoria
 *
 * Define dos sesiones de prueba sin credenciales reales: una para usuario regular (USER)
 * y otra para administrador (ADMIN). Se usan en el modo en memoria para desarrollo y pruebas.
 *
 * Tarea: T035
 * Depende de: T027 (InMemoryDesafiosAdapter), T011 (SesionActual)
 *
 * Fuente de verdad:
 * - plan.md: Sección 4 (estructura del proyecto)
 * - spec.md: Permisos y roles
 * - tasks.md: T035 (Sesiones simuladas)
 */

import type { SesionActual } from "../../domain/SesionActual";
import { RolUsuario } from "../../../domain/enums";

/**
 * Sesión de usuario regular (USER)
 * Simulado sin credenciales reales para desarrollo y pruebas.
 * ID: usuario-1
 * Rol: USER
 */
export const SESION_USUARIO: SesionActual = {
  usuarioId: "usuario-1",
  rol: RolUsuario.USER,
};

/**
 * Sesión de administrador (ADMIN)
 * Simulado sin credenciales reales para desarrollo y pruebas.
 * ID: admin-1
 * Rol: ADMIN
 */
export const SESION_ADMIN: SesionActual = {
  usuarioId: "admin-1",
  rol: RolUsuario.ADMIN,
};
