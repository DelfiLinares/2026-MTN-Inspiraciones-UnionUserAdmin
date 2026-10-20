/**
 * Servicio de aplicación `ModeracionService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-61 a RF-65, RF-80, resueltos A1 y A7)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T066)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/publicaciones/reportadas`, `GET /admin/reportes/{id}`,
 *   `DELETE /admin/publicaciones/{id}`, `POST /admin/reportes/{id}/resolver-sin-eliminar`)
 *
 * Responsabilidades:
 * - `listarPublicacionesReportadas(filtros)`: Devuelve el listado de reportes individuales
 *   (una fila por cada reporte individual, resuelto **A1**, RF-61) vía `GET /admin/publicaciones/reportadas`.
 * - `obtenerDetalleReporte(id)`: Obtiene la información completa de un reporte (`GET /admin/reportes/{id}`, RF-62).
 * - `eliminarPublicacion(publicacionId)`: Elimina la publicación reportada (`DELETE /admin/publicaciones/{id}`, RF-63).
 *   Soporta publicaciones de cualquier usuario independientemente de su rol (RF-80, resuelto **A7**).
 * - `resolverReporteSinEliminar(reporteId)`: Marca un reporte como "RESUELTO" sin alterar ni eliminar la
 *   publicación asociada (`POST /admin/reportes/{id}/resolver-sin-eliminar`, RF-64).
 */

import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { PublicacionModeracion } from '../domain/PublicacionModeracion'
import { Reporte } from '../domain/Reporte'
import { MotivoReporteAdmin as MotivoReporte } from '../domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../domain/enums/EstadoModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../domain/enums/EstadoPublicacionAdmin'
import { PrioridadReporte } from '../domain/enums/PrioridadReporte'
import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'
import {
  normalizarReporteBack,
  paginaDesdeBack,
  paramsListadoBack,
} from '../infrastructure/adaptadorReportesBack'
import type { PaginaBack, ReporteBack } from '../infrastructure/adaptadorReportesBack'

export interface FilaReporteModeracionDto {
  id: string
  publicacionId: string
  motivo: MotivoReporte
  reportanteId: string
  fecha: string
  estado: EstadoModeracion
  prioridad?: PrioridadReporte
  // Datos opcionales embebidos de la publicación/autor (resuelto A1)
  publicacion?: {
    id: string
    autorId: string
    estado: EstadoPublicacion
    cantidadReportes?: number
    motivosReporte?: MotivoReporte[]
  }
}

export type RespuestaReportesReportadosDto = PaginaBack<ReporteBack>

export interface ReporteDetalleDto extends FilaReporteModeracionDto {
  publicacion: {
    id: string
    autorId: string
    estado: EstadoPublicacion
    cantidadReportes?: number
    motivosReporte?: MotivoReporte[]
  }
  reportante?: {
    id: string
    nombre: string
    email?: string
    mail?: string
  }
}

export interface FiltrosModeracion {
  motivo?: MotivoReporte
  estado?: EstadoModeracion
  estadoReporte?: EstadoModeracion
  page?: number
  pageSize?: number
  ordenarPor?: 'antiguedad' | 'prioridad'
}

export interface ItemModeracionReporte {
  reporte: Reporte
  publicacion?: PublicacionModeracion
}

export interface PaginaModeracionReportes {
  items: ItemModeracionReporte[]
  total: number
}

export interface DetalleReporteModeracion {
  reporte: Reporte
  publicacion: PublicacionModeracion
  reportanteId: string
}

function mapearFilaBack(dto: ReporteBack): ItemModeracionReporte {
  const fila = normalizarReporteBack(dto) as unknown as FilaReporteModeracionDto
  return {
    reporte: mapearReporte(fila),
    publicacion: fila.publicacion ? mapearPublicacionModeracion(fila.publicacion) : undefined,
  }
}

function paramsModeracion(filtros: FiltrosModeracion) {
  return paramsListadoBack({
    page: filtros.page,
    pageSize: filtros.pageSize,
    estadoModeracion: filtros.estado ?? filtros.estadoReporte,
    motivo: filtros.motivo,
  })
}

function mapearReporte(dto: FilaReporteModeracionDto): Reporte {
  return new Reporte({
    id: dto.id,
    publicacionId: dto.publicacionId,
    motivo: dto.motivo,
    reportanteId: dto.reportanteId,
    fecha: dto.fecha,
    estado: dto.estado,
    prioridad: dto.prioridad,
  })
}

function mapearPublicacionModeracion(dtoPub: NonNullable<FilaReporteModeracionDto['publicacion']>): PublicacionModeracion {
  return new PublicacionModeracion({
    id: dtoPub.id,
    autorId: dtoPub.autorId,
    estado: dtoPub.estado,
    cantidadReportes: dtoPub.cantidadReportes ?? 1,
    motivosReporte: dtoPub.motivosReporte ?? [],
  })
}

/**
 * Obtiene el listado de moderación con una fila por cada reporte individual (RF-61, resuelto A1).
 * `GET /admin/publicaciones/reportadas`.
 */
export async function listarPublicacionesReportadas(
  filtros: FiltrosModeracion = {},
  options?: HttpRequestOptions
): Promise<PaginaModeracionReportes> {
  const respuesta = await httpClientAdmin.get<RespuestaReportesReportadosDto>(
    apiEndpoints.publicacionesReportadas(),
    { ...options, params: paramsModeracion(filtros) }
  )
  return paginaDesdeBack(respuesta, mapearFilaBack)
}

/**
 * Obtiene el detalle completo de un reporte individual (`GET /admin/reportes/{id}`, RF-62).
 */
export async function obtenerDetalleReporte(
  reporteId: string,
  options?: HttpRequestOptions
): Promise<DetalleReporteModeracion> {
  const dto = normalizarReporteBack(
    await httpClientAdmin.get<ReporteBack>(apiEndpoints.reporte(reporteId), options)
  ) as unknown as ReporteDetalleDto

  return {
    reporte: mapearReporte(dto),
    publicacion: mapearPublicacionModeracion(dto.publicacion),
    reportanteId: dto.reportanteId ?? dto.reportante?.id ?? '',
  }
}

/**
 * Elimina una publicación reportada (`DELETE /admin/publicaciones/{id}`, RF-63).
 * No distingue el rol del autor de la publicación (RF-80, resuelto A7).
 */
export async function eliminarPublicacion(
  publicacionId: string,
  options?: HttpRequestOptions
): Promise<void> {
  await httpClientAdmin.post<void>(
    apiEndpoints.eliminarPublicacionModeracion(publicacionId),
    undefined,
    options
  )
}

/**
 * Resuelve un reporte sin eliminar la publicación asociada (`POST /admin/reportes/{id}/resolver-sin-eliminar`, RF-64).
 */
export async function resolverReporteSinEliminar(
  reporteId: string,
  options?: HttpRequestOptions
): Promise<void> {
  await httpClientAdmin.post<void>(
    apiEndpoints.resolverReporteSinEliminar(reporteId),
    undefined,
    options
  )
}

/**
 * Clase orientada a inyección de dependencias (`HttpClient`) para el frontend de administración.
 */
export class ModeracionService {
  constructor(private readonly client: HttpClient = httpClientAdmin) {}

  async listarPublicacionesReportadas(
    filtros: FiltrosModeracion = {},
    options?: HttpRequestOptions
  ): Promise<PaginaModeracionReportes> {
    const respuesta = await this.client.get<RespuestaReportesReportadosDto>(
      apiEndpoints.publicacionesReportadas(),
      { ...options, params: paramsModeracion(filtros) }
    )
    return paginaDesdeBack(respuesta, mapearFilaBack)
  }

  async obtenerDetalleReporte(
    reporteId: string,
    options?: HttpRequestOptions
  ): Promise<DetalleReporteModeracion> {
    const dto = normalizarReporteBack(
      await this.client.get<ReporteBack>(apiEndpoints.reporte(reporteId), options)
    ) as unknown as ReporteDetalleDto

    return {
      reporte: mapearReporte(dto),
      publicacion: mapearPublicacionModeracion(dto.publicacion),
      reportanteId: dto.reportanteId ?? dto.reportante?.id ?? '',
    }
  }

  async eliminarPublicacion(
    publicacionId: string,
    options?: HttpRequestOptions
  ): Promise<void> {
    await this.client.post<void>(
      apiEndpoints.eliminarPublicacionModeracion(publicacionId),
      undefined,
      options
    )
  }

  async resolverReporteSinEliminar(
    reporteId: string,
    options?: HttpRequestOptions
  ): Promise<void> {
    await this.client.post<void>(
      apiEndpoints.resolverReporteSinEliminar(reporteId),
      undefined,
      options
    )
  }
}

export const moderacionService = {
  listarPublicacionesReportadas,
  obtenerDetalleReporte,
  eliminarPublicacion,
  resolverReporteSinEliminar,
}
