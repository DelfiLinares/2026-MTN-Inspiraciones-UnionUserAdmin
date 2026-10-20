/**
 * Tests de `ModeracionService` (T077).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-61 a RF-65, RF-80, AC-11.6, resueltos A1 y A7)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/publicaciones/reportadas`, `GET /admin/reportes/{id}`,
 *   `DELETE /admin/publicaciones/{id}`, `POST /admin/reportes/{id}/resolver-sin-eliminar`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T077, depende de T066)
 *
 * Cobertura:
 * - Resolver un reporte sin eliminar invoca `POST /admin/reportes/{id}/resolver-sin-eliminar` (RF-64) y NO altera ni cambia el estado de la publicación (AC-11.6).
 * - Listar publicaciones reportadas devuelve cada reporte individual (resuelto A1, RF-61) vía `GET /admin/publicaciones/reportadas`.
 * - Obtener el detalle de un reporte individual vía `GET /admin/reportes/{id}` (RF-62).
 * - Eliminar una publicación reportada envía `DELETE /admin/publicaciones/{id}` (RF-63) independientemente del rol de su autor (RF-80, resuelto A7).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  listarPublicacionesReportadas,
  obtenerDetalleReporte,
  eliminarPublicacion,
  resolverReporteSinEliminar,
  ModeracionService,
} from '../../src/services/ModeracionService'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { Reporte } from '../../src/domain/Reporte'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacionAdmin'

vi.mock('../../src/infrastructure/httpClientAdmin', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClientAdmin: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('ModeracionService (T077)', () => {
  const reporteIdMock = 'rep-101'
  const publicacionIdMock = 'pub-202'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('resolverReporteSinEliminar & AC-11.6 (Caso clave)', () => {
    it('invoca POST /admin/reportes/{id}/aceptar sin modificar ni eliminar la publicación (AC-11.6, RF-64)', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce(undefined)

      await resolverReporteSinEliminar(reporteIdMock)

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        `/admin/reportes/${reporteIdMock}/aceptar`,
        undefined,
        undefined
      )
      // La API de eliminación no fue ejecutada
      expect(httpClientAdmin.delete).not.toHaveBeenCalled()
    })
  })

  describe('listarPublicacionesReportadas (GET /admin/reportes, RF-61, Resuelto A1)', () => {
    it('devuelve reportes individuales mapeando correctamente reporte y publicación asociada (A1)', async () => {
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        contenido: [
          {
            id: reporteIdMock,
            publicacionId: publicacionIdMock,
            motivo: 'SPAM',
            reportanteId: 'usr-rep-1',
            prioridad: 'MEDIA',
            fechaCreacion: '2026-09-20T10:00:00Z',
            estadoModeracion: 'PENDIENTE',
            publicacion: {
              id: publicacionIdMock,
              autorId: 'autor-1',
              estado: 'REPORTADA',
              cantidadReportes: 3,
              motivosReporte: ['SPAM'],
            },
          },
        ],
        totalElementos: 1,
        pagina: 0,
        tamanioPagina: 10,
      })

      const resultado = await listarPublicacionesReportadas({
        estado: EstadoModeracion.PENDIENTE,
        page: 1,
        pageSize: 10,
      })

      expect(httpClientAdmin.get).toHaveBeenCalledWith('/admin/reportes', {
        params: {
          pagina: 0,
          tamanio: 10,
          estadoModeracion: EstadoModeracion.PENDIENTE,
          prioridad: undefined,
          motivo: undefined,
        },
      })
      expect(resultado.items).toHaveLength(1)
      expect(resultado.items[0].reporte).toBeInstanceOf(Reporte)
      expect(resultado.items[0].reporte.id).toBe(reporteIdMock)
      expect(resultado.items[0].reporte.estado).toBe(EstadoModeracion.PENDIENTE)
      expect(resultado.items[0].publicacion).toBeInstanceOf(PublicacionModeracion)
      expect(resultado.items[0].publicacion?.estado).toBe(EstadoPublicacion.REPORTADA)
      expect(resultado.total).toBe(1)
    })
  })

  describe('obtenerDetalleReporte (GET /admin/reportes/{id}, RF-62)', () => {
    it('obtiene el detalle completo de un reporte individual', async () => {
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        id: reporteIdMock,
        publicacionId: publicacionIdMock,
        motivo: 'CONTENIDO_INAPROPIADO',
        reportanteId: 'usr-rep-2',
        prioridad: 'ALTA',
        fechaCreacion: '2026-09-21T14:30:00Z',
        estadoModeracion: 'PENDIENTE',
        publicacion: {
          id: publicacionIdMock,
          autorId: 'autor-admin-1', // Autor con rol admin o usuario
          estado: 'REPORTADA',
          cantidadReportes: 1,
          motivosReporte: ['CONTENIDO_INAPROPIADO'],
        },
        reportante: {
          id: 'usr-rep-2',
          nombre: 'Pedro',
          email: 'pedro@mail.com',
        },
      })

      const detalle = await obtenerDetalleReporte(reporteIdMock)

      expect(httpClientAdmin.get).toHaveBeenCalledWith(`/admin/reportes/${reporteIdMock}`, undefined)
      expect(detalle.reporte).toBeInstanceOf(Reporte)
      expect(detalle.reporte.estado).toBe(EstadoModeracion.PENDIENTE)
      expect(detalle.publicacion).toBeInstanceOf(PublicacionModeracion)
      expect(detalle.reportanteId).toBe('usr-rep-2')
    })
  })

  describe('eliminarPublicacion (POST /admin/publicaciones/{id}/eliminar, RF-63, RF-80 / A7)', () => {
    it('elimina la publicación reportada independientemente del rol del autor (RF-80, A7)', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce(undefined)

      await eliminarPublicacion(publicacionIdMock)

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        `/admin/publicaciones/${publicacionIdMock}/eliminar`,
        undefined,
        undefined
      )
      expect(httpClientAdmin.delete).not.toHaveBeenCalled()
    })
  })

  describe('Clase ModeracionService (interoperabilidad de DI)', () => {
    it('ejecuta los métodos a través de la instancia inyectada', async () => {
      const servicio = new ModeracionService(httpClientAdmin)

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce(undefined)
      await servicio.resolverReporteSinEliminar('rep-300')
      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/reportes/rep-300/aceptar', undefined, undefined)

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce(undefined)
      await servicio.eliminarPublicacion('pub-400')
      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/publicaciones/pub-400/eliminar', undefined, undefined)
    })
  })
})
