/**
 * Servicio de reportes de publicaciones (HU-07, RF-33 a RF-36).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-33 a RF-36, AC-07.1 a AC-07.5)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /motivos-reporte`, `POST /publicaciones/{id}/reportes`, `GET /publicaciones/{id}/reportes/mio`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T059)
 *
 * Responsabilidades:
 * - `obtenerMotivos`: Obtiene el catálogo de motivos de reporte provistos por el backend (`GET /motivos-reporte`).
 * - `enviarReporte`: Envía un nuevo reporte (`POST /publicaciones/{id}/reportes`).
 * - `obtenerEstadoReporteMio`: Consulta si la publicación fue reportada por el usuario actual (`GET /publicaciones/{id}/reportes/mio`).
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import type { MotivoReporte } from '../domain/enums/MotivoReporte'

export interface MotivosReporteRespuestaDto {
  items: MotivoReporte[]
}

export interface EnviarReporteRespuestaDto {
  id: string
  estado: string
}

export interface EstadoReporteMioRespuestaDto {
  reportado: boolean
}

/**
 * Obtiene el catálogo de motivos de reporte disponibles (`GET /motivos-reporte`).
 */
export async function obtenerMotivos(
  options?: HttpRequestOptions
): Promise<MotivoReporte[]> {
  const respuesta = await httpClient.get<MotivosReporteRespuestaDto | MotivoReporte[]>(
    '/motivos-reporte',
    options
  )

  if (Array.isArray(respuesta)) {
    return respuesta
  }

  return Array.isArray(respuesta?.items) ? respuesta.items : []
}

/**
 * Envía un reporte para una publicación dada (`POST /publicaciones/{id}/reportes`).
 * Requiere un código de motivo (AC-07.4).
 */
export async function enviarReporte(
  publicacionId: string,
  motivoCodigo: string,
  options?: HttpRequestOptions
): Promise<EnviarReporteRespuestaDto> {
  const respuesta = await httpClient.post<EnviarReporteRespuestaDto>(
    `/publicaciones/${encodeURIComponent(publicacionId)}/reportes`,
    { motivoCodigo },
    options
  )
  return respuesta
}

/**
 * Consulta el estado de reporte propio para una publicación (`GET /publicaciones/{id}/reportes/mio`).
 * Refleja únicamente si el usuario actual ya reportó esta publicación (RF-35).
 */
export async function obtenerEstadoReporteMio(
  publicacionId: string,
  options?: HttpRequestOptions
): Promise<boolean> {
  try {
    const respuesta = await httpClient.get<EstadoReporteMioRespuestaDto>(
      `/publicaciones/${encodeURIComponent(publicacionId)}/reportes/mio`,
      options
    )
    return respuesta?.reportado === true
  } catch {
    return false
  }
}

export const reporteService = {
  obtenerMotivos,
  enviarReporte,
  obtenerEstadoReporteMio,
}
