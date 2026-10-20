import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../src/infrastructure/httpClient'
import { apiEndpoints } from '../../src/infrastructure/apiEndpoints'
import {
  guardarInteresesOnboarding,
  obtenerCatalogoOnboarding,
  obtenerMisInteresesOnboarding,
} from '../../src/services/onboardingInteresesService'

vi.mock('../../src/infrastructure/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('onboardingInteresesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtiene y agrupa las categorías del catálogo de la API', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      items: [
        { codigo: 'GENERO_ARTE', grupo: 'GENERO_ARTISTICO', nombre: 'Arte' },
        { codigo: 'ARTE_CUBISMO', grupo: 'TIPO_ARTE', nombre: 'Cubismo' },
        { codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' },
        { codigo: 'PUBLICACION_FOTO', grupo: 'OTRO', nombre: 'Fotografía' },
      ],
    })

    await expect(obtenerCatalogoOnboarding()).resolves.toEqual({
      generos: [{ codigo: 'GENERO_ARTE', grupo: 'GENERO_ARTISTICO', nombre: 'Arte' }],
      estilos: [{ codigo: 'ARTE_CUBISMO', grupo: 'TIPO_ARTE', nombre: 'Cubismo' }],
      tiposMusica: [{ codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' }],
    })
    expect(httpClient.get).toHaveBeenCalledWith(apiEndpoints.categoriasPublicaciones(), undefined)
  })

  it('rechaza un catálogo incompleto', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      items: [{ codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' }],
    })

    await expect(obtenerCatalogoOnboarding()).rejects.toThrow('no devolvió todas las categorías')
  })

  it('obtiene las categorías guardadas del usuario autenticado', async () => {
    const response = {
      generoIds: ['GENERO_ARTE'],
      estiloIds: ['ARTE_CUBISMO'],
      tipoMusicaIds: ['MUSICA_POP'],
      onboardingCompletado: true,
    }
    vi.mocked(httpClient.get).mockResolvedValue(response)

    await expect(obtenerMisInteresesOnboarding()).resolves.toEqual(response)
    expect(httpClient.get).toHaveBeenCalledWith(apiEndpoints.interesesOnboarding(), undefined)
  })

  it('persiste los códigos en el endpoint de onboarding', async () => {
    const payload = {
      generoIds: ['GENERO_ARTE'],
      estiloIds: ['ARTE_CUBISMO'],
      tipoMusicaIds: ['MUSICA_POP'],
    }
    const response = { ...payload, onboardingCompletado: true }
    vi.mocked(httpClient.put).mockResolvedValue(response)

    await expect(guardarInteresesOnboarding(payload)).resolves.toEqual(response)
    expect(httpClient.put).toHaveBeenCalledWith(apiEndpoints.interesesOnboarding(), payload, undefined)
  })
})
