/**
 * Test de servicio `ReportesService.listar()`, `.obtenerDetalle()`, `.aceptar()`, `.rechazar()`
 * con cliente HTTP simulado (mock), sin backend real.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T049, depende de T048)
 * - Union/specs/002-frontend-admin/spec.md RF-15, RF-16, RF-17, CB-03
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml
 *   (`GET /reportes`, `GET /reportes/{reporteId}`, `POST /reportes/{reporteId}/aceptar`,
 *   `POST /reportes/{reporteId}/rechazar`)
 *
 * Nota de nombrado: no existe colisión preexistente de `ReportesService` ni en
 * `Union/frontend/src/services/` ni en `src/application/` (el archivo homónimo más cercano es
 * `src/services/reporteService.ts`, con nombre y carpeta distintos, sin riesgo de colisión en
 * sistemas de archivos case-insensitive). Aun así, se nombra `ReportesService` tal como indica
 * `tasks.md` (T049/T050a–d), consumiendo el puerto `HttpClient` (T031, `AdminHttpClientPort.ts`)
 * y `apiEndpointsAdmin` (T048).
 *
 * Este test está escrito ANTES de la implementación (TDD, Principio VIII): debe fallar en este
 * momento porque `src/application/ReportesService.ts` aún no existe (se crea en T050a–T050d).
 *
 * Cobertura:
 * - `listar(filtros)`: invoca `HttpClient.get` en la ruta de `apiEndpointsAdmin.reportes()` con los
 *   filtros (`FiltroReportes`) como query params (RF-14).
 * - `obtenerDetalle(reporteId)`: invoca `HttpClient.get` en la ruta de
 *   `apiEndpointsAdmin.reporte(reporteId)`. Caso dedicado de éxito y caso dedicado de reporte
 *   inexistente (404), donde el error se propaga (CB-03).
 * - `aceptar(reporte)`: invoca `HttpClient.post` en la ruta de
 *   `apiEndpointsAdmin.aceptarReporte(reporte.id)` cuando `reporte.puedeAceptarse()` es true
 *   (delegado a la entidad `Reporte`, RF-15). Rechaza sin invocar el `HttpClient` cuando el reporte
 *   ya alcanzó un estado final (RF-17, CB-03).
 * - `rechazar(reporte)`: invoca `HttpClient.post` en la ruta de
 *   `apiEndpointsAdmin.rechazarReporte(reporte.id)` cuando `reporte.puedeRechazarse()` es true
 *   (RF-16). Rechaza sin invocar el `HttpClient` cuando el reporte ya alcanzó un estado final
 *   (RF-17, CB-03).
 */

import { describe, it, expect, vi } from 'vitest'
import { ReportesService } from '../../src/application/ReportesService'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../../src/infrastructure/apiEndpointsAdmin'
import { Reporte } from '../../src/domain/Reporte'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

function crearReportePendiente(id = 'rep-1'): Reporte {
  return new Reporte({
    id,
    publicacionId: 'pub-1',
    motivo: MotivoReporte.SPAM,
    reportanteId: 'usr-reportante-1',
    fecha: '2026-09-20T10:00:00.000Z',
    estado: EstadoModeracion.PENDIENTE,
    prioridad: PrioridadReporte.MEDIA,
  })
}

function crearReporteResuelto(id = 'rep-2'): Reporte {
  return new Reporte({
    id,
    publicacionId: 'pub-2',
    motivo: MotivoReporte.VIOLENCIA,
    reportanteId: 'usr-reportante-2',
    fecha: '2026-09-21T10:00:00.000Z',
    estado: EstadoModeracion.RESUELTO,
    prioridad: PrioridadReporte.ALTA,
  })
}

describe('ReportesService (T049)', () => {
  describe('listar()', () => {
    it('invoca HttpClient.get en la ruta de apiEndpointsAdmin.reportes() con los filtros como query params', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [], total: 0 })
      const servicio = new ReportesService(httpClient)

      await servicio.listar({
        estadoModeracion: EstadoModeracion.PENDIENTE,
        prioridad: PrioridadReporte.ALTA,
        motivo: MotivoReporte.SPAM,
      })

      expect(httpClient.get).toHaveBeenCalledWith(
        apiEndpointsAdmin.reportes(),
        expect.objectContaining({
          params: expect.objectContaining({
            estadoModeracion: EstadoModeracion.PENDIENTE,
            prioridad: PrioridadReporte.ALTA,
            motivo: MotivoReporte.SPAM,
          }),
        })
      )
    })
  })

  describe('obtenerDetalle()', () => {
    it('invoca HttpClient.get en la ruta de apiEndpointsAdmin.reporte(reporteId) y devuelve el reporte (éxito)', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'rep-20',
        publicacionId: 'pub-20',
        motivo: MotivoReporte.CONTENIDO_INAPROPIADO,
        reportanteId: 'usr-reportante-20',
        fecha: '2026-09-22T10:00:00.000Z',
        estado: EstadoModeracion.EN_REVISION,
        prioridad: PrioridadReporte.BAJA,
      })
      const servicio = new ReportesService(httpClient)

      const reporte = await servicio.obtenerDetalle('rep-20')

      expect(httpClient.get).toHaveBeenCalledWith(apiEndpointsAdmin.reporte('rep-20'), undefined)
      expect(reporte).toBeInstanceOf(Reporte)
      expect(reporte.id).toBe('rep-20')
      expect(reporte.estado).toBe(EstadoModeracion.EN_REVISION)
    })

    it('propaga el error cuando el reporte no existe (404, CB-03)', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('404 Not Found'))
      const servicio = new ReportesService(httpClient)

      await expect(servicio.obtenerDetalle('rep-inexistente')).rejects.toThrow('404 Not Found')
    })
  })

  describe('aceptar()', () => {
    it('invoca HttpClient.post en la ruta de apiEndpointsAdmin.aceptarReporte() cuando el reporte puede aceptarse', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new ReportesService(httpClient)
      const reporte = crearReportePendiente('rep-30')

      await servicio.aceptar(reporte)

      expect(httpClient.post).toHaveBeenCalledWith(apiEndpointsAdmin.aceptarReporte('rep-30'), undefined)
    })

    it('rechaza sin invocar HttpClient cuando el reporte ya alcanzó un estado final (RF-17, CB-03)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new ReportesService(httpClient)
      const reporte = crearReporteResuelto('rep-31')

      await expect(servicio.aceptar(reporte)).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })
  })

  describe('rechazar()', () => {
    it('invoca HttpClient.post en la ruta de apiEndpointsAdmin.rechazarReporte() cuando el reporte puede rechazarse', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new ReportesService(httpClient)
      const reporte = crearReportePendiente('rep-40')

      await servicio.rechazar(reporte)

      expect(httpClient.post).toHaveBeenCalledWith(apiEndpointsAdmin.rechazarReporte('rep-40'), undefined)
    })

    it('rechaza sin invocar HttpClient cuando el reporte ya alcanzó un estado final (RF-17, CB-03)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new ReportesService(httpClient)
      const reporte = crearReporteResuelto('rep-41')

      await expect(servicio.rechazar(reporte)).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })
  })
})
