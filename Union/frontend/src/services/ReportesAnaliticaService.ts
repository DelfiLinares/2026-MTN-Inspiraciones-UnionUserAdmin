/**
 * Servicio de aplicación `ReportesAnaliticaService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-71 a RF-74)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T068)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/analiticas`, `POST /admin/reportes-analiticas/exportaciones`)
 *
 * Ambigüedades B3 y B5 (trato flexible de respuestas diferidas):
 * - `GET /admin/analiticas`: Trata los datos como `Record<string, unknown>` genérico (RF-71, B3).
 * - `POST /admin/reportes-analiticas/exportaciones`: Es una llamada SÍNCRONA (RF-72, RF-73).
 *   La respuesta indica `disponible: boolean` y trae `urlDescarga` (URL opaca, B5) o `errorMensaje` (RF-74).
 * - Si el backend falla, mapea o asigna el mensaje obligatorio "Error: Reporte no generado." (RF-74).
 */

import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { ExportacionReporte } from '../domain/ExportacionReporte'
import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'

export const MENSAJE_ERROR_REPORTE_NO_GENERADO = 'Error: Reporte no generado.'

export interface ExportacionReporteDto {
  disponible: boolean
  urlDescarga?: string | null
  errorMensaje?: string | null
  mensajeError?: string | null
  reporteAnaliticaId?: string
  exitoso?: boolean
}

export interface SolicitarExportacionDatos {
  tipoReporte?: string
  reporteAnaliticaId?: string
  filtros?: Record<string, unknown>
}

/**
 * Mapea la DTO de la API a la entidad de dominio `ExportacionReporte`.
 * Si `disponible` es false o falla y no hay `errorMensaje` explícito,
 * asigna el mensaje especificado en RF-74 ("Error: Reporte no generado.").
 */
function mapearExportacionReporte(dto: ExportacionReporteDto): ExportacionReporte {
  const disponible = dto.disponible ?? dto.exitoso ?? false
  let errorMensaje = dto.errorMensaje ?? dto.mensajeError ?? undefined

  if (!disponible && !errorMensaje) {
    errorMensaje = MENSAJE_ERROR_REPORTE_NO_GENERADO
  }

  return new ExportacionReporte({
    disponible,
    urlDescarga: dto.urlDescarga ?? undefined,
    errorMensaje,
    reporteAnaliticaId: dto.reporteAnaliticaId,
  })
}

/**
 * Obtiene analíticas agregadas de la plataforma (`GET /admin/analiticas`, RF-71).
 * Maneja la respuesta como `Record<string, unknown>` para preservar flexibilidad ante Ambigüedad B3.
 */
export async function obtenerAnaliticas(
  options?: HttpRequestOptions
): Promise<Record<string, unknown>> {
  return httpClientAdmin.get<Record<string, unknown>>(apiEndpoints.analiticas(), options)
}

/**
 * Dispara una exportación de reporte de forma síncrona (`POST /admin/reportes-analiticas/exportaciones`, RF-72, RF-73).
 * Ante fallos o `disponible: false`, asegura exponer `errorMensaje = "Error: Reporte no generado."` (RF-74).
 */
export async function exportarReporteAnalitica(
  datos: SolicitarExportacionDatos | string,
  options?: HttpRequestOptions
): Promise<ExportacionReporte> {
  const cuerpo: Record<string, unknown> =
    typeof datos === 'string'
      ? { reporteAnaliticaId: datos, tipoReporte: datos }
      : {
          tipoReporte: datos.tipoReporte ?? datos.reporteAnaliticaId,
          reporteAnaliticaId: datos.reporteAnaliticaId,
          filtros: datos.filtros,
        }

  try {
    const dto = await httpClientAdmin.post<ExportacionReporteDto>(
      apiEndpoints.iniciarExportacionReporteAnalitica(),
      cuerpo,
      options
    )
    return mapearExportacionReporte(dto)
  } catch (error) {
    // Si la API responde con error HTTP (500/502), retorna la entidad con fallo (RF-74)
    const errorBody =
      error && typeof error === 'object' && 'body' in error ? (error as { body?: unknown }).body : null

    const mensajeServidor =
      errorBody && typeof errorBody === 'object' && 'errorMensaje' in errorBody
        ? String((errorBody as { errorMensaje: unknown }).errorMensaje)
        : MENSAJE_ERROR_REPORTE_NO_GENERADO

    return new ExportacionReporte({
      disponible: false,
      errorMensaje: mensajeServidor || MENSAJE_ERROR_REPORTE_NO_GENERADO,
    })
  }
}

/**
 * Clase `ReportesAnaliticaService` (orientada a inyección de dependencias `HttpClient`).
 */
export class ReportesAnaliticaService {
  constructor(private readonly client: HttpClient = httpClientAdmin) {}

  async obtenerAnaliticas(options?: HttpRequestOptions): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(apiEndpoints.analiticas(), options)
  }

  async exportarReporte(
    datos: SolicitarExportacionDatos | string,
    options?: HttpRequestOptions
  ): Promise<ExportacionReporte> {
    const cuerpo: Record<string, unknown> =
      typeof datos === 'string'
        ? { reporteAnaliticaId: datos, tipoReporte: datos }
        : {
            tipoReporte: datos.tipoReporte ?? datos.reporteAnaliticaId,
            reporteAnaliticaId: datos.reporteAnaliticaId,
            filtros: datos.filtros,
          }

    try {
      const dto = await this.client.post<ExportacionReporteDto>(
        apiEndpoints.iniciarExportacionReporteAnalitica(),
        cuerpo,
        options
      )
      return mapearExportacionReporte(dto)
    } catch (error) {
      const errorBody =
        error && typeof error === 'object' && 'body' in error ? (error as { body?: unknown }).body : null

      const mensajeServidor =
        errorBody && typeof errorBody === 'object' && 'errorMensaje' in errorBody
          ? String((errorBody as { errorMensaje: unknown }).errorMensaje)
          : MENSAJE_ERROR_REPORTE_NO_GENERADO

      return new ExportacionReporte({
        disponible: false,
        errorMensaje: mensajeServidor || MENSAJE_ERROR_REPORTE_NO_GENERADO,
      })
    }
  }
}

export const reportesAnaliticaService = {
  obtenerAnaliticas,
  exportarReporteAnalitica,
}
