import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../src/infrastructure/httpClient'
import {
  enviarReporte,
  obtenerEstadoReporteMio,
  obtenerMotivos,
} from '../../src/services/reporteService'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, httpClient: { get: vi.fn(), post: vi.fn() } }
})

describe('reporteService (contrato real del back)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtenerMotivos devuelve el catálogo local sin llamar a la API', async () => {
    const motivos = await obtenerMotivos()

    expect(httpClient.get).not.toHaveBeenCalled()
    expect(motivos.map((m) => m.codigo)).toEqual([
      'SPAM',
      'CONTENIDO_INAPROPIADO',
      'PLAGIO_DERECHOS_AUTOR',
      'VIOLENCIA',
      'OTRO',
    ])
    expect(motivos.every((m) => m.etiqueta.length > 0)).toBe(true)
  })

  it('enviarReporte envía { motivo } y devuelve la respuesta del back', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({ id: 'r1', estadoModeracion: 'PENDIENTE' })

    const respuesta = await enviarReporte('pub-1', 'SPAM')

    expect(httpClient.post).toHaveBeenCalledWith('/publicaciones/pub-1/reportes', { motivo: 'SPAM' }, undefined)
    expect(respuesta.id).toBe('r1')
  })

  it('obtenerEstadoReporteMio consulta /reportes/mio y devuelve el booleano', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ reportado: true })

    await expect(obtenerEstadoReporteMio('pub-1')).resolves.toBe(true)
    expect(httpClient.get).toHaveBeenCalledWith('/publicaciones/pub-1/reportes/mio', undefined)
  })
})
