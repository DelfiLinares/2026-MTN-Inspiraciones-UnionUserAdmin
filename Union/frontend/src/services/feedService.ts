/**
 * Servicio de feed de publicaciones para Home.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, RNF-05, CB-05)
 * - Contrato de publicaciones: `GET /api/feed/recomendaciones`
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T056)
 *
 * Responsabilidades:
 * - Obtiene recomendaciones con cursor opaco, compatible con `useInfiniteList`.
 * - Mapea los resultados a entidades `Publicacion` de dominio.
 * - Envía un límite de 1 a 20 resultados (por defecto 3).
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { Publicacion } from '../domain/Publicacion'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import type { PaginaResultado } from './useInfiniteList'

export interface PublicacionFeedDto {
  id: string
  /** Nombres del contrato Java (PublicacionResponse), con aliases legacy para feeds previos. */
  usuarioId?: string
  autorId?: string
  contenido?: string
  tipoContenido: TipoContenido
  estado?: EstadoPublicacion
  fotoUrl?: string
  createdAt?: string
  comentariosCount?: number
  reaccionesCount?: number
  hashtags?: string[]
  tags?: string[]
  cantidadLikes?: number
  likeDelUsuarioActual?: boolean
  reportadaPorUsuarioActual?: boolean
  urlContenido?: string
  titulo?: string
  descripcion?: string
  creadaEn?: string
}

export interface FeedResponseDto {
  items: PublicacionFeedDto[]
  nextPage?: number | null
  nextCursor?: string | null
  total?: number
}

export interface OpcionesFeed {
  cursor?: string | null
  limite?: number
}

export interface PreferenciasFeedDto {
  categorias: string[]
  hashtags: string[]
}

export interface ConsentimientoFeedRequest {
  aceptoUsoParaEntrenamiento: boolean
  policyVersion: string
}

function mapearPublicacion(dto: PublicacionFeedDto): Publicacion {
  return new Publicacion({
    id: dto.id,
    autorId: dto.usuarioId ?? dto.autorId ?? '',
    tipoContenido: dto.tipoContenido,
    estado: dto.estado ?? EstadoPublicacion.ACTIVA,
    tags: dto.hashtags ?? dto.tags ?? [],
    cantidadLikes: dto.reaccionesCount ?? dto.cantidadLikes ?? 0,
    likeDelUsuarioActual: dto.likeDelUsuarioActual ?? false,
    reportadaPorUsuarioActual: dto.reportadaPorUsuarioActual ?? false,
    contenido: dto.contenido ?? dto.descripcion ?? dto.titulo,
    fotoUrl: dto.fotoUrl ?? dto.urlContenido,
    creadaEn: dto.createdAt ?? dto.creadaEn,
    cantidadComentarios: dto.comentariosCount,
  })
}

function validarLimite(limite?: number): number {
  const valor = limite ?? 3
  if (!Number.isInteger(valor) || valor < 1 || valor > 20) {
    throw new RangeError('El límite del feed debe ser un entero entre 1 y 20.')
  }
  return valor
}

/**
 * Obtiene un lote de recomendaciones (`GET /feed/recomendaciones`), compatible con `useInfiniteList`.
 */
export async function obtenerPagina(
  cursor: string | null,
  opciones?: HttpRequestOptions
): Promise<PaginaResultado<Publicacion>> {
  const queryParams: Record<string, string | number | undefined> = { limite: 3 }
  if (cursor) {
    queryParams.cursor = cursor
  }

  const respuesta = await httpClient.get<FeedResponseDto>(
    apiEndpoints.feedRecomendaciones(),
    {
      ...opciones,
      params: {
        ...queryParams,
        ...opciones?.params,
      },
    }
  )

  const itemsRaw = Array.isArray(respuesta?.items) ? respuesta.items : []
  const items = itemsRaw.map(mapearPublicacion)
  const nextPage = respuesta?.nextPage ?? null
  const siguienteCursor = respuesta?.nextCursor ?? null

  return {
    items,
    nextPage,
    siguienteCursor,
    total: respuesta?.total,
  }
}

/**
 * Consulta recomendaciones con cursor opaco y límite configurable de 1 a 20 resultados.
 */
export async function obtenerFeed(
  opciones?: OpcionesFeed,
  requestOptions?: HttpRequestOptions
): Promise<PaginaResultado<Publicacion>> {
  const queryParams: Record<string, string | number | undefined> = {
    limite: validarLimite(opciones?.limite),
  }
  if (opciones?.cursor) {
    queryParams.cursor = opciones.cursor
  }

  const respuesta = await httpClient.get<FeedResponseDto>(
    apiEndpoints.feedRecomendaciones(),
    {
      ...requestOptions,
      params: {
        ...queryParams,
        ...requestOptions?.params,
      },
    }
  )

  const itemsRaw = Array.isArray(respuesta?.items) ? respuesta.items : []
  const items = itemsRaw.map(mapearPublicacion)
  const nextPage = respuesta?.nextPage ?? null
  const siguienteCursor = respuesta?.nextCursor ?? null

  return {
    items,
    nextPage,
    siguienteCursor,
    total: respuesta?.total,
  }
}

export async function obtenerPreferenciasFeed(): Promise<PreferenciasFeedDto> {
  return httpClient.get<PreferenciasFeedDto>(apiEndpoints.preferenciasFeed())
}

export async function reemplazarPreferenciasFeed(
  preferencias: PreferenciasFeedDto,
): Promise<PreferenciasFeedDto> {
  return httpClient.put<PreferenciasFeedDto>(apiEndpoints.preferenciasFeed(), preferencias)
}

export async function registrarConsentimientoFeed(
  consentimiento: ConsentimientoFeedRequest,
): Promise<void> {
  await httpClient.put<void>(apiEndpoints.consentimientoFeedPiloto(), consentimiento)
}

export async function retirarConsentimientoFeed(): Promise<void> {
  await httpClient.delete<void>(apiEndpoints.consentimientoFeedPiloto())
}

export const feedService = {
  obtenerPagina,
  obtenerFeed,
  obtenerPreferenciasFeed,
  reemplazarPreferenciasFeed,
  registrarConsentimientoFeed,
  retirarConsentimientoFeed,
}
