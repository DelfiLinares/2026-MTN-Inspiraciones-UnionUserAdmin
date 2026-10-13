import { beforeEach, describe, expect, it, vi } from 'vitest'
import { feedService } from '../../src/services/feedService'
import { httpClient } from '../../src/infrastructure/httpClient'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('feedService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('consulta recomendaciones con cursor opaco y límite por defecto', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ items: [], nextCursor: 'cursor-siguiente' })

    const pagina = await feedService.obtenerPagina('cursor-opaco')

    expect(httpClient.get).toHaveBeenCalledWith('/feed/recomendaciones', {
      params: { limite: 3, cursor: 'cursor-opaco' },
    })
    expect(pagina.siguienteCursor).toBe('cursor-siguiente')
  })

  it('valida el límite antes de enviar la consulta', async () => {
    await expect(feedService.obtenerFeed({ limite: 21 })).rejects.toThrow(
      'El límite del feed debe ser un entero entre 1 y 20.',
    )
    expect(httpClient.get).not.toHaveBeenCalled()
  })

  it('consulta y reemplaza preferencias, y registra o retira consentimiento', async () => {
    const preferencias = { categorias: ['ARTE'], hashtags: ['digital'] }
    const consentimiento = { aceptoUsoParaEntrenamiento: true, policyVersion: 'v1' }
    vi.mocked(httpClient.get).mockResolvedValueOnce(preferencias)
    vi.mocked(httpClient.put)
      .mockResolvedValueOnce(preferencias)
      .mockResolvedValueOnce(undefined)
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

    await feedService.obtenerPreferenciasFeed()
    await feedService.reemplazarPreferenciasFeed(preferencias)
    await feedService.registrarConsentimientoFeed(consentimiento)
    await feedService.retirarConsentimientoFeed()

    expect(httpClient.get).toHaveBeenCalledWith('/usuarios/me/preferencias')
    expect(httpClient.put).toHaveBeenNthCalledWith(
      1,
      '/usuarios/me/preferencias',
      preferencias,
    )
    expect(httpClient.put).toHaveBeenNthCalledWith(
      2,
      '/feed/piloto/consentimiento',
      consentimiento,
    )
    expect(httpClient.delete).toHaveBeenCalledWith('/feed/piloto/consentimiento')
  })
})