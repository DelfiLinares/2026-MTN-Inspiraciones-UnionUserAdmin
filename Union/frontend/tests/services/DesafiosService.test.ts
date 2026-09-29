/**
 * Tests de `DesafiosService` (T078).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-66 a RF-70, CB-15, AC-14.5)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/desafios-propuestos`, `GET /admin/desafios-propuestos/{id}`,
 *   `POST /admin/desafios-propuestos/{id}/aprobar`, `POST /admin/desafios-propuestos/{id}/rechazar`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T078, depende de T067)
 *
 * Cobertura:
 * - Caso crítico AC-14.5 / CB-15: intentar aprobar o rechazar un desafío propuesto que ya fue APROBADO o RECHAZADO es bloqueado de inmediato sin llamar a la API (lanza `DesafioYaResueltoError`).
 * - Transición válida de estado PENDIENTE: aprobar invoca `POST /admin/desafios-propuestos/{id}/aprobar` y rechazar invoca `POST /admin/desafios-propuestos/{id}/rechazar`.
 * - Búsqueda paginada en servidor mediante `GET /admin/desafios-propuestos` (RF-66).
 * - Obtención de detalles completos de un desafío propuesto con `contenidoFormulario` (RF-67).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  listarDesafiosPropuestos,
  obtenerDetalleDesafioPropuesto,
  aprobarDesafio,
  rechazarDesafio,
  DesafioYaResueltoError,
  DesafiosService,
} from '../../src/services/DesafiosService'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { DesafioPropuesto } from '../../src/domain/DesafioPropuesto'
import { EstadoDesafioPropuesto } from '../../src/domain/enums/EstadoDesafioPropuesto'

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

function crearDesafioPendiente(id = 'des-1'): DesafioPropuesto {
  return new DesafioPropuesto({
    id,
    autorId: 'autor-10',
    titulo: 'Desafío de Retrato',
    descripcion: 'Pintar un retrato con técnica digital',
    estado: EstadoDesafioPropuesto.PENDIENTE,
  })
}

function crearDesafioAprobado(id = 'des-2'): DesafioPropuesto {
  return new DesafioPropuesto({
    id,
    autorId: 'autor-10',
    titulo: 'Desafío Resuelto',
    descripcion: 'Ya fue aprobado',
    estado: EstadoDesafioPropuesto.APROBADO,
  })
}

function crearDesafioRechazado(id = 'des-3'): DesafioPropuesto {
  return new DesafioPropuesto({
    id,
    autorId: 'autor-10',
    titulo: 'Desafío Rechazado',
    descripcion: 'Ya fue rechazado',
    estado: EstadoDesafioPropuesto.RECHAZADO,
  })
}

describe('DesafiosService (T078)', () => {
  const desafioIdMock = 'des-100'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Caso crítico AC-14.5 / CB-15 (Irreversibilidad de la decisión)', () => {
    it('bloquea aprobar un desafío que ya está APROBADO sin invocar a la API (AC-14.5)', async () => {
      const desafioAprobado = crearDesafioAprobado()

      await expect(aprobarDesafio(desafioAprobado)).rejects.toThrow(DesafioYaResueltoError)
      await expect(aprobarDesafio(desafioAprobado)).rejects.toThrow(
        /ya fue resuelto previamente/i
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })

    it('bloquea rechazar un desafío que ya está APROBADO sin invocar a la API (AC-14.5)', async () => {
      const desafioAprobado = crearDesafioAprobado()

      await expect(rechazarDesafio(desafioAprobado)).rejects.toThrow(DesafioYaResueltoError)
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })

    it('bloquea aprobar un desafío que ya está RECHAZADO sin invocar a la API (AC-14.5)', async () => {
      const desafioRechazado = crearDesafioRechazado()

      await expect(aprobarDesafio(desafioRechazado)).rejects.toThrow(DesafioYaResueltoError)
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })

    it('bloquea rechazar un desafío que ya está RECHAZADO sin invocar a la API (AC-14.5)', async () => {
      const desafioRechazado = crearDesafioRechazado()

      await expect(rechazarDesafio(desafioRechazado)).rejects.toThrow(DesafioYaResueltoError)
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })
  })

  describe('aprobarDesafio (POST /admin/desafios-propuestos/{id}/aprobar, RF-68)', () => {
    it('aprueba un desafío en estado PENDIENTE invocando a la API', async () => {
      const desafioPendiente = crearDesafioPendiente('des-10')
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'des-10',
        autorId: 'autor-10',
        titulo: 'Desafío de Retrato',
        estado: 'APROBADO' as EstadoDesafioPropuesto,
      })

      const resultado = await aprobarDesafio(desafioPendiente)

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        '/admin/desafios-propuestos/des-10/aprobar',
        undefined,
        undefined
      )
      expect(resultado).toBeInstanceOf(DesafioPropuesto)
      expect(resultado.estado).toBe(EstadoDesafioPropuesto.APROBADO)
    })

    it('soporta pasar el ID como string delegando la validación de estado a la API', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: desafioIdMock,
        autorId: 'autor-5',
        estado: 'APROBADO' as EstadoDesafioPropuesto,
      })

      const resultado = await aprobarDesafio(desafioIdMock)

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        `/admin/desafios-propuestos/${desafioIdMock}/aprobar`,
        undefined,
        undefined
      )
      expect(resultado.estado).toBe(EstadoDesafioPropuesto.APROBADO)
    })
  })

  describe('rechazarDesafio (POST /admin/desafios-propuestos/{id}/rechazar, RF-69)', () => {
    it('rechaza un desafío en estado PENDIENTE invocando a la API', async () => {
      const desafioPendiente = crearDesafioPendiente('des-20')
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'des-20',
        autorId: 'autor-10',
        titulo: 'Desafío de Retrato',
        estado: 'RECHAZADO' as EstadoDesafioPropuesto,
      })

      const resultado = await rechazarDesafio(desafioPendiente)

      expect(httpClientAdmin.post).toHaveBeenCalledWith(
        '/admin/desafios-propuestos/des-20/rechazar',
        undefined,
        undefined
      )
      expect(resultado).toBeInstanceOf(DesafioPropuesto)
      expect(resultado.estado).toBe(EstadoDesafioPropuesto.RECHAZADO)
    })
  })

  describe('listarDesafiosPropuestos (GET /admin/desafios-propuestos, RF-66)', () => {
    it('obtiene la lista paginada de desafíos propuestos filtrando por estado PENDIENTE por defecto', async () => {
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        items: [
          {
            id: 'des-1',
            autorId: 'autor-1',
            titulo: 'Acuarela',
            estado: 'PENDIENTE' as EstadoDesafioPropuesto,
          },
        ],
        total: 1,
      })

      const pagina = await listarDesafiosPropuestos({ page: 1, pageSize: 10 })

      expect(httpClientAdmin.get).toHaveBeenCalledWith('/admin/desafios-propuestos', {
        params: {
          estado: EstadoDesafioPropuesto.PENDIENTE,
          page: 1,
          pageSize: 10,
        },
      })
      expect(pagina.items).toHaveLength(1)
      expect(pagina.items[0]).toBeInstanceOf(DesafioPropuesto)
      expect(pagina.total).toBe(1)
    })
  })

  describe('obtenerDetalleDesafioPropuesto (GET /admin/desafios-propuestos/{id}, RF-67)', () => {
    it('obtiene los detalles completos de un desafío propuesto incluyendo contenidoFormulario', async () => {
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        id: desafioIdMock,
        autorId: 'autor-9',
        titulo: 'Reto 3D',
        descripcion: 'Crear modelo 3D',
        contenidoFormulario: { software: 'Blender' },
        estado: 'PENDIENTE' as EstadoDesafioPropuesto,
      })

      const detalle = await obtenerDetalleDesafioPropuesto(desafioIdMock)

      expect(httpClientAdmin.get).toHaveBeenCalledWith(
        `/admin/desafios-propuestos/${desafioIdMock}`,
        undefined
      )
      expect(detalle).toBeInstanceOf(DesafioPropuesto)
      expect(detalle.contenidoFormulario).toEqual({ software: 'Blender' })
    })
  })

  describe('Clase DesafiosService (interoperabilidad)', () => {
    it('ejecuta los métodos a través de la instancia inyectada con HttpClient', async () => {
      const servicio = new DesafiosService(httpClientAdmin)
      const desafio = crearDesafioPendiente('des-inst-1')

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'des-inst-1',
        autorId: 'autor-10',
        estado: 'APROBADO' as EstadoDesafioPropuesto,
      })

      const resAprobar = await servicio.aprobar(desafio)
      expect(resAprobar.estado).toBe(EstadoDesafioPropuesto.APROBADO)

      const resRechazarErr = servicio.rechazar(crearDesafioAprobado())
      await expect(resRechazarErr).rejects.toThrow(DesafioYaResueltoError)
    })
  })
})
