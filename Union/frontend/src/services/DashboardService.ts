/**
 * Servicio de aplicación `DashboardService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-54, RF-55)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T064)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/dashboard`)
 *
 * Responsabilidades:
 * - Obtiene los 7 indicadores del dashboard desde `GET /admin/dashboard`:
 *   1. `reportesPendientes`
 *   2. `usuariosActivos`
 *   3. `desafiosPendientes`
 *   4. `publicacionesActivas`
 *   5. `publicacionesEliminadas`
 *   6. `usuariosBaneados`
 *   7. `desafiosAprobadosRechazados` (o `desafiosDecididos`)
 * - Cumple con RF-55: NO recalcula ningún indicador en el cliente, retornando directamente
 *   los valores pre-agregados por el backend.
 */

import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'

export interface DashboardIndicadoresDto {
  reportesPendientes: number
  usuariosActivos: number
  desafiosPendientes: number
  publicacionesActivas: number
  publicacionesEliminadas: number
  usuariosBaneados: number
  desafiosAprobadosRechazados?: number
  desafiosDecididos?: number
}

export interface IndicadoresDashboard {
  reportesPendientes: number
  usuariosActivos: number
  desafiosPendientes: number
  publicacionesActivas: number
  publicacionesEliminadas: number
  usuariosBaneados: number
  desafiosAprobadosRechazados: number
}

function mapearIndicadores(dto: DashboardIndicadoresDto): IndicadoresDashboard {
  return {
    reportesPendientes: dto.reportesPendientes ?? 0,
    usuariosActivos: dto.usuariosActivos ?? 0,
    desafiosPendientes: dto.desafiosPendientes ?? 0,
    publicacionesActivas: dto.publicacionesActivas ?? 0,
    publicacionesEliminadas: dto.publicacionesEliminadas ?? 0,
    usuariosBaneados: dto.usuariosBaneados ?? 0,
    desafiosAprobadosRechazados: dto.desafiosAprobadosRechazados ?? dto.desafiosDecididos ?? 0,
  }
}

/**
 * Obtiene los 7 indicadores agregados del dashboard de administración (RF-54, RF-55).
 * Consulta la ruta `GET /admin/dashboard` sin realizar recálculo en el cliente.
 */
export async function obtenerIndicadoresDashboard(
  options?: HttpRequestOptions
): Promise<IndicadoresDashboard> {
  const dto = await httpClientAdmin.get<DashboardIndicadoresDto>(apiEndpoints.dashboard(), options)
  return mapearIndicadores(dto)
}

/**
 * Clase `DashboardService` orientada a inyección de dependencias (`HttpClient`),
 * manteniendo compatibilidad con la firma usada en pruebas unitarias y puertos.
 */
export class DashboardService {
  constructor(private readonly client: HttpClient = httpClientAdmin) {}

  async obtenerIndicadores(options?: HttpRequestOptions): Promise<IndicadoresDashboard> {
    const dto = await this.client.get<DashboardIndicadoresDto>(apiEndpoints.dashboard(), options)
    return mapearIndicadores(dto)
  }
}

export const dashboardService = {
  obtenerIndicadores: obtenerIndicadoresDashboard,
}
