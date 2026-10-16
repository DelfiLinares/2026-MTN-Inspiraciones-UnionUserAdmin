/**
 * Test de servicio `ExportacionService.exportar()` con cliente HTTP simulado (mock), sin backend
 * real.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T051, depende de T048)
 * - Union/specs/002-frontend-admin/spec.md RF-19, RF-20, CB-05
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml (`POST /reportes/exportar`)
 *
 * Nota de nombrado: no existe colisión preexistente de `ExportacionService` ni en
 * `Union/frontend/src/services/` ni en `src/application/`.
 *
 * Este test está escrito ANTES de la implementación (TDD, Principio VIII): debe fallar en este
 * momento porque `src/application/ExportacionService.ts` aún no existe (se crea en T052).
 *
 * Cobertura:
 * - `exportar(filtros)`: invoca `HttpClient.post` en la ruta de
 *   `apiEndpointsAdmin.exportarReportes()`, respetando el `FiltroReportes` activo como cuerpo de la
 *   solicitud (RF-19). Caso de éxito: devuelve un `ResultadoExportacion` con `exitoso === true` y
 *   `urlDescarga` presente.
 * - `exportar(filtros)`: caso de fallo (CB-05): cuando el `HttpClient` rechaza (p. ej. error 500 del
 *   backend, "Reporte no generado"), el método NO relanza la excepción; en su lugar, devuelve un
 *   `ResultadoExportacion` con `exitoso === false` y `mensajeError` definido (RF-20), de forma que
 *   la capa de presentación pueda mostrar el mensaje de error sin necesidad de un try/catch propio.
 */

import { describe, it, expect, vi } from 'vitest'
import { ExportacionService } from '../../src/application/ExportacionService'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../../src/infrastructure/apiEndpointsAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('ExportacionService (T051)', () => {
  describe('exportar()', () => {
    it('invoca HttpClient.post en la ruta de apiEndpointsAdmin.exportarReportes() respetando los filtros activos y devuelve éxito con urlDescarga', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        urlDescarga: 'https://descargas.ejemplo.com/reportes/export-123.csv',
        nombreArchivoSugerido: 'reportes-export-123.csv',
      })
      const servicio = new ExportacionService(httpClient)

      const resultado = await servicio.exportar({
        estadoModeracion: EstadoModeracion.PENDIENTE,
        prioridad: PrioridadReporte.ALTA,
        motivo: MotivoReporte.SPAM,
      })

      expect(httpClient.post).toHaveBeenCalledWith(
        apiEndpointsAdmin.exportarReportes(),
        expect.objectContaining({
          estadoModeracion: EstadoModeracion.PENDIENTE,
          prioridad: PrioridadReporte.ALTA,
          motivo: MotivoReporte.SPAM,
        })
      )
      expect(resultado.exitoso).toBe(true)
      expect(resultado.urlDescarga).toBe('https://descargas.ejemplo.com/reportes/export-123.csv')
      expect(resultado.mensajeError).toBeUndefined()
    })

    it('devuelve un resultado no exitoso con mensajeError cuando la exportación falla luego de iniciada (CB-05)', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Reporte no generado'))
      const servicio = new ExportacionService(httpClient)

      const resultado = await servicio.exportar({})

      expect(resultado.exitoso).toBe(false)
      expect(resultado.urlDescarga).toBeUndefined()
      expect(resultado.mensajeError).toBeDefined()
      expect(typeof resultado.mensajeError).toBe('string')
    })
  })
})
