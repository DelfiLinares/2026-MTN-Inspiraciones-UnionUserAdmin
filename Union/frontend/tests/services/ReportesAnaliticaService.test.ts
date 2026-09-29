/**
 * Tests de `ReportesAnaliticaService` (T079).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-71 a RF-74)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/analiticas`, `POST /admin/reportes-analiticas/exportaciones`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T079, depende de T068)
 *
 * Cobertura:
 * - Caso clave RF-74: Manejo de fallo de exportación exponiendo el mensaje exacto "Error: Reporte no generado." (cuando la API responde disponible=false sin mensaje o con un error HTTP).
 * - Exportación exitosa síncrona retornando `disponible: true` y la URL de descarga (RF-72, RF-73).
 * - Obtención de analíticas agregadas vía `GET /admin/analiticas` manejado como `Record<string, unknown>` genérico (B3, RF-71).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  obtenerAnaliticas,
  exportarReporteAnalitica,
  MENSAJE_ERROR_REPORTE_NO_GENERADO,
  ReportesAnaliticaService,
} from '../../src/services/ReportesAnaliticaService'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { ExportacionReporte } from '../../src/domain/ExportacionReporte'

vi.mock('../../src/infrastructure/httpClientAdmin', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClientAdmin: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

describe('ReportesAnaliticaService (T079)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Caso clave RF-74 (Mensaje exacto "Error: Reporte no generado.")', () => {
    it('retorna ExportacionReporte con disponible=false y mensaje exacto "Error: Reporte no generado." cuando la respuesta indica disponible=false sin mensaje explícito (RF-74)', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        disponible: false,
      })

      const resultado = await exportarReporteAnalitica({ tipoReporte: 'publicaciones' })

      expect(resultado).toBeInstanceOf(ExportacionReporte)
      expect(resultado.disponible).toBe(false)
      expect(resultado.errorMensaje).toBe(MENSAJE_ERROR_REPORTE_NO_GENERADO)
      expect(resultado.errorMensaje).toBe('Error: Reporte no generado.')
    })

    it('retorna ExportacionReporte con el mensaje exacto "Error: Reporte no generado." ante un fallo HTTP de la API (500 Internal Server Error) (RF-74)', async () => {
      vi.mocked(httpClientAdmin.post).mockRejectedValueOnce({
        status: 500,
        message: 'Internal Server Error',
        body: null,
      })

      const resultado = await exportarReporteAnalitica('usuarios-mensuales')

      expect(resultado).toBeInstanceOf(ExportacionReporte)
      expect(resultado.disponible).toBe(false)
      expect(resultado.errorMensaje).toBe(MENSAJE_ERROR_REPORTE_NO_GENERADO)
      expect(resultado.errorMensaje).toBe('Error: Reporte no generado.')
    })

    it('preserva un mensaje de error específico proporcionado por el servidor en la respuesta del body', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        disponible: false,
        errorMensaje: 'Límite de rango de fechas excedido',
      })

      const resultado = await exportarReporteAnalitica({ tipoReporte: 'moderacion' })

      expect(resultado.disponible).toBe(false)
      expect(resultado.errorMensaje).toBe('Límite de rango de fechas excedido')
    })
  })

  describe('exportarReporteAnalitica (POST /admin/reportes-analiticas/exportaciones, RF-72, RF-73)', () => {
    it('realiza la exportación síncrona retornando disponible=true y urlDescarga', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        disponible: true,
        urlDescarga: 'https://api.platform.com/downloads/reporte-2026-09.csv',
        reporteAnaliticaId: 'rep-an-1',
      })

      const resultado = await exportarReporteAnalitica({
        tipoReporte: 'desafios',
        filtros: { mes: 9, anio: 2026 },
      })

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        '/admin/reportes-analiticas/exportaciones',
        {
          tipoReporte: 'desafios',
          reporteAnaliticaId: undefined,
          filtros: { mes: 9, anio: 2026 },
        },
        undefined
      )

      expect(resultado).toBeInstanceOf(ExportacionReporte)
      expect(resultado.disponible).toBe(true)
      expect(resultado.urlDescarga).toBe('https://api.platform.com/downloads/reporte-2026-09.csv')
      expect(resultado.errorMensaje).toBeUndefined()
    })
  })

  describe('obtenerAnaliticas (GET /admin/analiticas, RF-71, Ambigüedad B3)', () => {
    it('obtiene los datos de analíticas agregadas preservando la estructura JSON genérica (B3)', async () => {
      const mockAnaliticas = {
        totalUsuarios: 1500,
        publicacionesMes: 320,
        tasaConversion: 0.15,
        graficos: { visitas: [10, 20, 30] },
      }

      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce(mockAnaliticas)

      const resultado = await obtenerAnaliticas()

      expect(httpClientAdmin.get).toHaveBeenCalledWith('/admin/analiticas', undefined)
      expect(resultado).toEqual(mockAnaliticas)
    })
  })

  describe('Clase ReportesAnaliticaService (interoperabilidad de DI)', () => {
    it('ejecuta los métodos a través de la instancia inyectada con HttpClient', async () => {
      const servicio = new ReportesAnaliticaService(httpClientAdmin)

      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({ kpi: 42 })
      const resGet = await servicio.obtenerAnaliticas()
      expect(resGet).toEqual({ kpi: 42 })

      vi.mocked(httpClientAdmin.post).mockRejectedValueOnce(new Error('Network error'))
      const resExp = await servicio.exportarReporte('reporte-1')
      expect(resExp.disponible).toBe(false)
      expect(resExp.errorMensaje).toBe(MENSAJE_ERROR_REPORTE_NO_GENERADO)
    })
  })
})
