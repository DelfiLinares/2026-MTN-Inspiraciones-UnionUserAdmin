import type {
  CatalogoOnboardingDTO,
  CategoriaOnboardingDTO,
  GuardarInteresesOnboardingDTO,
  InteresesOnboardingResponseDTO,
} from '../application/dto/OnboardingInteresesDTO'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { httpClient, type HttpRequestOptions } from '../infrastructure/httpClient'

interface CategoriaCatalogoResponseDTO {
  items: CategoriaOnboardingDTO[]
}

const GRUPOS_ONBOARDING = {
  generos: 'GENERO_ARTISTICO',
  estilos: 'TIPO_ARTE',
  tiposMusica: 'TIPO_MUSICA',
} as const

export async function obtenerCatalogoOnboarding(
  options?: HttpRequestOptions,
): Promise<CatalogoOnboardingDTO> {
  const response = await httpClient.get<CategoriaCatalogoResponseDTO>(
    apiEndpoints.categoriasPublicaciones(),
    options,
  )

  if (!Array.isArray(response?.items)) {
    throw new Error('La API devolvió un catálogo de intereses inválido.')
  }

  const catalogo = {
    generos: response.items.filter((item) => item.grupo === GRUPOS_ONBOARDING.generos),
    estilos: response.items.filter((item) => item.grupo === GRUPOS_ONBOARDING.estilos),
    tiposMusica: response.items.filter((item) => item.grupo === GRUPOS_ONBOARDING.tiposMusica),
  }

  if (Object.values(catalogo).some((items) => items.length === 0)) {
    throw new Error('La API no devolvió todas las categorías necesarias para el onboarding.')
  }

  return catalogo
}

export function obtenerMisInteresesOnboarding(
  options?: HttpRequestOptions,
): Promise<InteresesOnboardingResponseDTO> {
  return httpClient.get<InteresesOnboardingResponseDTO>(
    apiEndpoints.interesesOnboarding(),
    options,
  )
}

export function guardarInteresesOnboarding(
  intereses: GuardarInteresesOnboardingDTO,
  options?: HttpRequestOptions,
): Promise<InteresesOnboardingResponseDTO> {
  return httpClient.put<InteresesOnboardingResponseDTO>(
    apiEndpoints.interesesOnboarding(),
    intereses,
    options,
  )
}
