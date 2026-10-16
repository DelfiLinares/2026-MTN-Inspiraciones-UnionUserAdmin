import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'

/**
 * `SeguimientoRepository`: Puerto para operaciones de seguimiento (follow/unfollow).
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, AC-04, A4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 7, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (SeguimientoRelacion value object)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (endpoints seguimiento)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T058)
 *
 * Contrato para operaciones HTTP de seguimiento bidireccional (A4: toggle follow/unfollow).
 * Implementación concreta: HttpSeguimientoRepository (T060).
 *
 * Responsabilidades:
 * 1. Obtener estado de seguimiento actual entre dos usuarios
 * 2. Toggle seguimiento (A4: alterna entre seguir / no seguir)
 * 3. Manejar errores de autorización y validación
 *
 * Manejo de errores:
 * - 400: Validación fallida (ej: no se puede seguir a sí mismo)
 * - 401: Usuario no autenticado
 * - 403: Permiso denegado
 * - 404: Usuario a seguir no existe
 * - 507: Error en el servidor
 *
 * Historias de usuario:
 * - HU-04: Seguir a otra persona (con toggle: seguir / dejar de seguir)
 *
 * Criterios de aceptación:
 * - AC-04.1: Opción de seguir visible en perfil ajeno
 * - AC-04.2: Disponible para cualquier autenticado
 * - AC-04.3: Refleja estado tras éxito
 * - AC-04.4: Maneja errores sin cambiar estado si falla
 * - AC-04.5: No requiere confirmación
 *
 * Clarificaciones:
 * - A4: Botón alterna entre "Seguir" / "Dejar de seguir" (toggle bidireccional)
 *
 * Notas:
 * - T058: Define solo el puerto (contrato)
 * - T060: Implementa adaptación HTTP (HttpSeguimientoRepository)
 * - T059: Encapsula lógica de seguimiento con optimistic update + rollback
 */

/**
 * DTO para resultado de toggle de seguimiento.
 * Retorna el nuevo estado de la relación tras toggle.
 */
export interface ResultadoToggleSeguimiento {
  usuarioId: string
  usuarioASeguidoId: string
  ahora_siguiendo: boolean // true si ahora sigue, false si ahora no sigue
  timestamp?: Date
}

/**
 * Interfaz del puerto SeguimientoRepository.
 * Define contrato para todas las operaciones de seguimiento.
 */
export interface SeguimientoRepository {
  /**
   * HU-04: Obtener estado de seguimiento actual entre dos usuarios.
   *
   * @param usuarioId — ID del usuario autenticado que consulta
   * @param usuarioASeguidoId — ID del usuario cuyo estado de seguimiento se consulta
   * @returns Objeto SeguimientoRelacion con estado actual (true si sigue, false si no)
   * @throws 401: Usuario no autenticado
   * @throws 404: Usuario a seguir no existe
   * @throws 507: Error del servidor
   */
  obtenerEstadoSeguimiento(usuarioId: string, usuarioASeguidoId: string): Promise<SeguimientoRelacion>

  /**
   * HU-04 + A4: Toggle seguimiento (seguir / dejar de seguir).
   * Alterna el estado de seguimiento entre dos usuarios de forma bidireccional.
   *
   * Operación idempotente a nivel del toggle: llamadas consecutivas con el mismo estado
   * de seguimiento deben producir resultados consistentes.
   *
   * @param usuarioId — ID del usuario autenticado que ejecuta la acción
   * @param usuarioASeguidoId — ID del usuario a seguir/dejar de seguir
   * @returns Objeto con nuevo estado de seguimiento tras toggle
   * @throws 400: Validación fallida (ej: no se puede seguir a sí mismo)
   * @throws 401: Usuario no autenticado
   * @throws 403: Permiso denegado
   * @throws 404: Usuario a seguir no existe
   * @throws 507: Error del servidor
   *
   * Ejemplo flujo:
   * 1. Usuario A abre perfil de Usuario B
   * 2. obtenerEstadoSeguimiento() retorna { siguiendo: false }
   * 3. Usuario A hace click en "Seguir"
   * 4. toggleSeguimiento() se ejecuta → retorna { ahora_siguiendo: true }
   * 5. UI actualiza botón a "Dejar de seguir"
   * 6. Si falla: UI revierte estado (rollback en PerfilAjeno/SeguimientoService)
   */
  toggleSeguimiento(
    usuarioId: string,
    usuarioASeguidoId: string,
    ahoraSiguiendo: boolean,
  ): Promise<ResultadoToggleSeguimiento>
}
