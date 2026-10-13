import { SeguimientoRelacion } from '../domain/SeguimientoRelacion'
import { SeguimientoRepository, ResultadoToggleSeguimiento } from '../application/ports/SeguimientoRepository'
import { obtenerEstadoSeguimiento as obtenerEstadoSeguimientoHttp, toggleSeguimiento as toggleSeguimientoHttp } from './busquedaService'

/**
 * Adaptador HTTP SeguimientoRepository — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (paths: /seguimientos/{usuarioId}/{usuarioASeguidoId})
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, A4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 7, capa infrastructure)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T060)
 *
 * Implementación HTTP del puerto SeguimientoRepository (T058).
 * Mapea endpoints HTTP a métodos del puerto y gestiona errores.
 *
 * Responsabilidades:
 * 1. Obtener estado de seguimiento actual entre dos usuarios (GET /seguimientos/{usuarioId}/{usuarioASeguidoId})
 * 2. Toggle de seguimiento bidireccional (POST /seguimientos/{usuarioId}/{usuarioASeguidoId}/toggle)
 * 3. Mapear errores HTTP a excepciones con detalles
 * 4. Convertir DTO HTTP a entidad SeguimientoRelacion de dominio
 * 5. Soportar optimistic update + rollback (A4)
 *
 * Manejo de errores:
 * - 400: Validación fallida (no se puede seguir a sí mismo)
 * - 401: Usuario no autenticado
 * - 403: Permiso denegado
 * - 404: Usuario a seguir no existe
 * - 507: Error del servidor
 *
 * Historias: HU-04
 *
 * Patrón de optimistic update (A4):
 * - UI actualiza estado local inmediatamente (toggle)
 * - Servicio (SeguimientoService) ejecuta toggleSeguimiento
 * - Si éxito: Confirma estado
 * - Si error: UI revierte estado (rollback)
 */

/**
 * Implementación HTTP del puerto SeguimientoRepository.
 * Delega a funciones en busquedaService.ts que ya tienen lógica HTTP establecida.
 */
class HttpSeguimientoRepository implements SeguimientoRepository {
  /**
   * HU-04: Obtener estado de seguimiento actual entre dos usuarios.
   *
   * @param usuarioId — ID del usuario autenticado
   * @param usuarioASeguidoId — ID del usuario cuyo estado se consulta
   * @returns SeguimientoRelacion con estado actual
   * @throws Error si falla la llamada HTTP
   */
  async obtenerEstadoSeguimiento(
    usuarioId: string,
    usuarioASeguidoId: string
  ): Promise<SeguimientoRelacion> {
    return obtenerEstadoSeguimientoHttp(usuarioId, usuarioASeguidoId)
  }

  /**
   * HU-04 + A4: Toggle de seguimiento (seguir / dejar de seguir).
   *
   * Alterna el estado de seguimiento de forma bidireccional.
   *
   * @param usuarioId — ID del usuario autenticado que ejecuta
   * @param usuarioASeguidoId — ID del usuario a seguir/dejar de seguir
   * @returns Objeto con nuevo estado tras toggle
   * @throws Error si falla la llamada HTTP
   */
  async toggleSeguimiento(
    usuarioId: string,
    usuarioASeguidoId: string
  ): Promise<ResultadoToggleSeguimiento> {
    const resultado = await toggleSeguimientoHttp(usuarioId, usuarioASeguidoId)
    return {
      usuarioId: resultado.usuarioId,
      usuarioASeguidoId: resultado.usuarioASeguidoId,
      ahora_siguiendo: resultado.ahora_siguiendo,
      timestamp: new Date(),
    }
  }
}

/**
 * Instancia singleton de HttpSeguimientoRepository.
 * Se exporta para inyección de dependencias en SeguimientoService.
 */
export const httpSeguimientoRepository: SeguimientoRepository = new HttpSeguimientoRepository()
