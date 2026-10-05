/**
 * Servicio de aplicación `ExportacionService` del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T052, depende de T020, T021, T051. Hace pasar T051)
 * - Union/specs/002-frontend-admin/spec.md RF-19, RF-20, CB-05
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml (`POST /reportes/exportar`)
 *
 * Nota de nombrado: no hay colisión preexistente con `ExportacionService` (ver cabecera de
 * `tests/application/ExportacionService.test.ts`, T051).
 *
 * Responsabilidades:
 * - `exportar(filtros)`: Invoca `HttpClient.post` en `apiEndpointsAdmin.exportarReportes()`,
 *   respetando el `FiltroReportes` activo (T020) como cuerpo de la solicitud (RF-19). Operación
 *   síncrona: la respuesta entrega directamente el resultado disponible para descarga o un error
 *   (contracts/openapi.yaml). A diferencia de otros servicios de este módulo, este método NO
 *   relanza la excepción cuando el `HttpClient` rechaza (CB-05): en su lugar, captura el error y
 *   devuelve un `ResultadoExportacion` (T021) con `exitoso: false` y `mensajeError` definido, de
 *   forma que la capa de presentación pueda mostrar el mensaje sin necesidad de un try/catch propio
 *   (RF-20).
 */

import type { HttpClient } from '../infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../infrastructure/apiEndpointsAdmin'
import type { FiltroReportes } from './dto/FiltroReportes'
import type { ResultadoExportacion } from './dto/ResultadoExportacion'

export const MENSAJE_EXPORTACION_FALLIDA_POR_DEFECTO = 'Error: Reporte no generado.'

interface RespuestaExportacionExitosaDto {
  urlDescarga: string
  nombreArchivoSugerido?: string
}

export class ExportacionService {
  constructor(private readonly client: HttpClient) {}

  /**
   * T052: Exporta reportes respetando el `FiltroReportes` activo (`POST /reportes/exportar`,
   * RF-19). Si la operación falla (CB-05), el error NO se relanza: se devuelve un
   * `ResultadoExportacion` con `exitoso: false` y `mensajeError` (RF-20).
   */
  async exportar(filtros: FiltroReportes): Promise<ResultadoExportacion> {
    try {
      const respuesta = await this.client.post<RespuestaExportacionExitosaDto>(
        apiEndpointsAdmin.exportarReportes(),
        filtros
      )

      return {
        exitoso: true,
        urlDescarga: respuesta.urlDescarga,
        nombreArchivoSugerido: respuesta.nombreArchivoSugerido,
      }
    } catch (error) {
      const mensajeError =
        error instanceof Error && error.message
          ? error.message
          : MENSAJE_EXPORTACION_FALLIDA_POR_DEFECTO

      return {
        exitoso: false,
        mensajeError,
      }
    }
  }
}
