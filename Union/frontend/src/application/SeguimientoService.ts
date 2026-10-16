import { SeguimientoRelacion } from '../domain/SeguimientoRelacion'
import { SeguimientoRepository, ResultadoToggleSeguimiento } from './ports/SeguimientoRepository'

/**
 * Servicio SeguimientoService — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, AC-04, A4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 7, capa application)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (SeguimientoRelacion value object)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T059)
 *
 * Servicio de aplicación que orquesta casos de uso de seguimiento bidireccional.
 * Implementa optimistic update + rollback (A4) sin estar acoplado a infraestructura HTTP.
 *
 * Responsabilidades:
 * 1. HU-04: Toggle de seguimiento (seguir / dejar de seguir)
 * 2. Obtener estado actual de seguimiento
 * 3. Implementar optimistic update: toggle local inmediato, revert si error (AC-04.4)
 *
 * Validaciones de dominio:
 * - Usuario no puede seguirse a sí mismo (400 backend)
 * - Toggle es bidireccional (seguir/dejar de seguir con mismo botón, A4)
 * - Autorización: Cualquier autenticado puede seguir a otro (AC-04.2)
 * - Sin confirmación explícita (AC-04.5, no destructiva)
 * - Estado actualiza tras éxito en interfaz (AC-04.3)
 * - Estado NO cambia si falla (AC-04.4, rollback)
 *
 * Estrategia de Optimistic Update (A4):
 * - Paso 1: UI obtiene estado actual con obtenerEstadoSeguimiento()
 * - Paso 2: Usuario hace click en botón (Seguir / Dejar de seguir)
 * - Paso 3: UI actualiza estado localmente (toggle inmediato)
 * - Paso 4: Servicio ejecuta toggleSeguimiento() contra backend
 * - Paso 5: Si éxito (200): Confirma estado local (ya está actualizado)
 * - Paso 6: Si error: Revierte estado local al anterior (rollback)
 *
 * Inyección de dependencias:
 * - repository: SeguimientoRepository — Implementación concreta (HTTP adapter, T060)
 *
 * Historias de usuario:
 * - HU-04: Seguir a otra persona
 *
 * Clarificaciones aplicadas:
 * - A4: Toggle bidireccional (seguir/dejar de seguir)
 * - AC-04.3: Refleja estado tras éxito
 * - AC-04.4: Rollback si falla, estado no cambia en interfaz
 * - AC-04.5: Sin confirmación explícita
 */
export class SeguimientoService {
  constructor(private repository: SeguimientoRepository) {}

  /**
   * HU-04: Obtener estado actual de seguimiento.
   *
   * Caso de uso:
   * - Usuario abre perfil ajeno
   * - Sistema carga estado de seguimiento actual
   * - UI muestra botón "Seguir" o "Dejar de seguir" según estado
   * - AC-04.1: Opción de seguir visible en perfil ajeno
   * - AC-04.2: Disponible para cualquier autenticado
   *
   * Validaciones de dominio:
   * - usuario1Id y usuario2Id deben ser válidos (no vacíos)
   * - Retorna estado actual: true si sigue, false si no
   *
   * Parámetros:
   * - usuarioActualId: string — ID del usuario autenticado
   * - usuarioASeguidoId: string — ID del usuario cuyo estado se consulta
   *
   * Retorna:
   * - SeguimientoRelacion con estado actual (siguiendo: boolean)
   *   - usuarioId: ID del usuario que sigue
   *   - usuarioASeguidoId: ID del usuario siendo seguido
   *   - siguiendo: true si está siendo seguido, false si no
   *
   * Errores:
   * - 401: Usuario no autenticado
   * - 404: Usuario a seguir no existe
   * - 507: Error del servidor
   *
   * Referencias:
   * - spec.md HU-04, AC-04.1–AC-04.2
   * - openapi.yaml GET /seguimientos/{usuarioId}/{usuarioASeguidoId}
   * - data-model.md SeguimientoRelacion value object
   */
  async obtenerEstadoSeguimiento(
    usuarioActualId: string,
    usuarioASeguidoId: string
  ): Promise<SeguimientoRelacion> {
    if (!usuarioActualId || usuarioActualId.trim() === '') {
      throw new Error('ID de usuario autenticado requerido')
    }

    if (!usuarioASeguidoId || usuarioASeguidoId.trim() === '') {
      throw new Error('ID de usuario a seguir requerido')
    }

    return this.repository.obtenerEstadoSeguimiento(usuarioActualId, usuarioASeguidoId)
  }

  /**
   * HU-04 + A4: Toggle de seguimiento con optimistic update + rollback.
   *
   * Implementa estrategia de optimistic update para mejor UX:
   * - UI actualiza estado localmente de inmediato (toggle)
   * - Servicio ejecuta operación contra backend
   * - Si éxito: Confirma estado (ya está actualizado)
   * - Si error: Revierte estado al anterior (rollback)
   *
   * Esto permite:
   * - AC-04.3: Interfaz refleja nuevo estado tras éxito
   * - AC-04.4: Estado NO cambia si falla (rollback)
   * - AC-04.5: Sin confirmación explícita (mejor UX)
   *
   * Pasos de uso desde componente (ej: PerfilAjeno.tsx):
   * 1. Estado local: seguimiento = { usuarioId, usuarioASeguidoId, siguiendo: false }
   * 2. User click → setSeguimiento(seguimiento.toggle()) (optimistic)
   * 3. toggleSeguimiento(usuarioId, usuarioASeguidoId).catch(err => {
   *      setSeguimiento(seguimiento) // Rollback
   *      showError(err)
   *    })
   *
   * Validaciones de dominio:
   * - Usuario no puede seguirse a sí mismo (400 backend)
   * - Toggle es bidireccional (seguir → no seguir, o viceversa)
   * - Autorización: Cualquier autenticado puede seguir a otro
   *
   * Parámetros:
   * - usuarioActualId: string — ID del usuario autenticado que ejecuta
   * - usuarioASeguidoId: string — ID del usuario a seguir/dejar de seguir
   *
   * Retorna:
   * - ResultadoToggleSeguimiento con nuevo estado tras toggle
   *   - usuarioId: ID del usuario que sigue
   *   - usuarioASeguidoId: ID del usuario siendo seguido
   *   - ahora_siguiendo: true si ahora está siendo seguido, false si no
   *
   * Errores:
   * - 400: Validación fallida (ej: no se puede seguir a sí mismo)
   * - 401: Usuario no autenticado
   * - 403: Permiso denegado
   * - 404: Usuario a seguir no existe
   * - 507: Error del servidor
   *
   * Referencias:
   * - spec.md HU-04, AC-04.3–AC-04.5, A4
   * - openapi.yaml POST/PUT /seguimientos/{usuarioId}/{usuarioASeguidoId}
   * - data-model.md SeguimientoRelacion.toggle() y métodos helper
   */
  async toggleSeguimiento(
    usuarioActualId: string,
    usuarioASeguidoId: string,
    ahoraSiguiendo: boolean,
  ): Promise<ResultadoToggleSeguimiento> {
    if (!usuarioActualId || usuarioActualId.trim() === '') {
      throw new Error('ID de usuario autenticado requerido')
    }

    if (!usuarioASeguidoId || usuarioASeguidoId.trim() === '') {
      throw new Error('ID de usuario a seguir requerido')
    }

    if (usuarioActualId === usuarioASeguidoId) {
      throw new Error('No se puede seguir a sí mismo')
    }

    return this.repository.toggleSeguimiento(
      usuarioActualId,
      usuarioASeguidoId,
      ahoraSiguiendo,
    )
  }
}
