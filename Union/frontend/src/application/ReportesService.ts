/**
 * Servicio de aplicación `ReportesService` del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T050a: `listar()`, depende de T011, T012, T013, T019,
 *   T020, T049; T050b: `obtenerDetalle()`, depende de T011, T019, T050a, hace pasar la porción
 *   "detalle" de T049; T050c: `aceptar()`, depende de T011, T019, T050a, hace pasar la porción
 *   "aceptar" de T049; T050d: `rechazar()`, depende de T011, T018, T019, T050a, hace pasar la
 *   porción "rechazar" de T049)
 * - Union/specs/002-frontend-admin/spec.md RF-14, RF-15, RF-16, RF-17, CB-03, AC-08.6
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml
 *   (`GET /reportes`, `GET /reportes/{reporteId}`, `POST /reportes/{reporteId}/aceptar`,
 *   `POST /reportes/{reporteId}/rechazar`)
 *
 * Nota de nombrado: no hay colisión preexistente con `ReportesService` (ver cabecera de
 * `tests/application/ReportesService.test.ts`, T049).
 *
 * Responsabilidades:
 * - `listar(filtros)`: Búsqueda paginada de reportes (`GET /reportes`), con filtro por
 *   `FiltroReportes` (T020: `estadoModeracion`, `prioridad`, `motivo`).
 * - `obtenerDetalle(reporteId)`: Consulta el detalle de un reporte (`GET /reportes/{reporteId}`).
 *   Si el reporte no existe (404), el error se propaga sin transformarse (CB-03).
 * - `aceptar(reporte)`: Delega `reporte.puedeAceptarse()` a la entidad `Reporte` (T019) antes de
 *   invocar el `HttpClient`. RF-15, RF-17.
 * - `rechazar(reporte, publicacionAsociada?)`: Delega `reporte.puedeRechazarse()` a la entidad
 *   `Reporte` antes de invocar el `HttpClient`. RF-16, RF-17. Tras una respuesta exitosa, si se
 *   provee `publicacionAsociada`, invoca
 *   `publicacionAsociada.reactivarSiNoQuedanReportesPendientes()` (T018) con base en el estado de
 *   la publicación embebido en la respuesta del backend, reactivando la publicación localmente a
 *   `ACTIVA` cuando no quedan otros reportes `PENDIENTE`/`EN_REVISION` (AC-08.6, Clarifications
 *   Session 2026-10-01/2026-10-05).
 */

import type { HttpClient } from '../infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../infrastructure/apiEndpointsAdmin'
import { Reporte } from '../domain/Reporte'
import { PublicacionModeracion } from '../domain/PublicacionModeracion'
import { EstadoModeracion } from '../domain/enums/EstadoModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from '../domain/enums/MotivoReporteAdmin'
import type { PrioridadReporte } from '../domain/enums/PrioridadReporte'
import type { FiltroReportes } from './dto/FiltroReportes'

export const MENSAJE_REPORTE_NO_ACCIONABLE =
  'El reporte ya alcanzó un estado final y no puede aceptarse ni rechazarse.'

export class ReporteNoAccionableError extends Error {
  constructor(mensaje = MENSAJE_REPORTE_NO_ACCIONABLE) {
    super(mensaje)
    this.name = 'ReporteNoAccionableError'
  }
}

export interface ReporteDto {
  id: string
  publicacionId: string
  motivo: string
  reportanteId: string
  fecha: string
  estado: string
  prioridad?: string
  publicacion?: {
    id: string
    autorId: string
    estado: string
    cantidadReportes: number
    motivosReporte: string[]
  }
}

export interface ListarReportesFiltros extends FiltroReportes {
  page?: number
  pageSize?: number
}

export interface PaginaReportesAdmin {
  items: Reporte[]
  total: number
}

function mapearReporte(dto: ReporteDto): Reporte {
  return new Reporte({
    id: dto.id,
    publicacionId: dto.publicacionId,
    motivo: (dto.motivo as MotivoReporte) || MotivoReporte.OTRO,
    reportanteId: dto.reportanteId,
    fecha: dto.fecha,
    estado: (dto.estado as EstadoModeracion) || EstadoModeracion.PENDIENTE,
    prioridad: dto.prioridad as PrioridadReporte | undefined,
  })
}

interface RespuestaListaReportesDto {
  items: ReporteDto[]
  total: number
}

export class ReportesService {
  constructor(private readonly client: HttpClient) {}

  /**
   * T050a: Búsqueda paginada de reportes (`GET /reportes`, RF-14).
   */
  async listar(filtros: ListarReportesFiltros = {}): Promise<PaginaReportesAdmin> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: filtros.page ?? 1,
      pageSize: filtros.pageSize ?? 10,
      estadoModeracion: filtros.estadoModeracion,
      prioridad: filtros.prioridad,
      motivo: filtros.motivo,
    }

    const respuesta = await this.client.get<RespuestaListaReportesDto>(apiEndpointsAdmin.reportes(), {
      params,
    })

    const items = Array.isArray(respuesta.items) ? respuesta.items.map(mapearReporte) : []
    const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

    return { items, total }
  }

  /**
   * T050b: Consulta el detalle de un reporte (`GET /reportes/{reporteId}`, RF-13). Si el reporte
   * no existe (404), el error se propaga sin transformarse (CB-03).
   */
  async obtenerDetalle(reporteId: string): Promise<Reporte> {
    const dto = await this.client.get<ReporteDto>(apiEndpointsAdmin.reporte(reporteId), undefined)
    return mapearReporte(dto)
  }

  /**
   * T050c: Acepta un reporte (`POST /reportes/{reporteId}/aceptar`, RF-15). Valida
   * `reporte.puedeAceptarse()` antes de invocar el `HttpClient`.
   */
  async aceptar(reporte: Reporte): Promise<void> {
    if (!reporte.puedeAceptarse()) {
      throw new ReporteNoAccionableError()
    }

    await this.client.post<void>(apiEndpointsAdmin.aceptarReporte(reporte.id), undefined)
  }

  /**
   * T050d: Rechaza un reporte (`POST /reportes/{reporteId}/rechazar`, RF-16). Valida
   * `reporte.puedeRechazarse()` antes de invocar el `HttpClient`. Tras una respuesta exitosa, si se
   * provee `publicacionAsociada`, invoca `reactivarSiNoQuedanReportesPendientes()` sobre ella
   * (AC-08.6): la publicación embebida en la respuesta del backend indica si quedan otros reportes
   * `PENDIENTE`/`EN_REVISION` (estado `REPORTADA`) o no (estado `ACTIVA`).
   */
  async rechazar(reporte: Reporte, publicacionAsociada?: PublicacionModeracion): Promise<void> {
    if (!reporte.puedeRechazarse()) {
      throw new ReporteNoAccionableError()
    }

    const respuesta = await this.client.post<ReporteDto>(
      apiEndpointsAdmin.rechazarReporte(reporte.id),
      undefined
    )

    if (publicacionAsociada && respuesta?.publicacion) {
      const hayOtrosReportesPendientesOEnRevision =
        respuesta.publicacion.estado === EstadoPublicacion.REPORTADA
      publicacionAsociada.reactivarSiNoQuedanReportesPendientes(
        hayOtrosReportesPendientesOEnRevision
      )
    }
  }
}
