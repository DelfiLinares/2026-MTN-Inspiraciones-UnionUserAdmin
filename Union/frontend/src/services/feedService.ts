/**
 * Servicio de feed de publicaciones para Home.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, RNF-05, CB-05)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /publicaciones/feed`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T056)
 *
 * Responsabilidades:
 * - Obtiene el feed paginado (`GET /publicaciones/feed`), compatible con `useInfiniteList` (T054).
 * - Mapea los resultados a entidades `Publicacion` de dominio.
 * - Soporta paginación por página numérica (`page`, `pageSize`) y cursor opaco.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import type { PaginaResultado } from './useInfiniteList'

export interface PublicacionFeedDto {
  id: string
  autorId: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
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
  page?: number
  pageSize?: number
  cursor?: string | null
}

function mapearPublicacion(dto: PublicacionFeedDto): Publicacion {
  return new Publicacion({
    id: dto.id,
    autorId: dto.autorId,
    tipoContenido: dto.tipoContenido,
    estado: dto.estado ?? EstadoPublicacion.ACTIVA,
    tags: dto.tags ?? [],
    cantidadLikes: dto.cantidadLikes ?? 0,
    likeDelUsuarioActual: dto.likeDelUsuarioActual ?? false,
    reportadaPorUsuarioActual: dto.reportadaPorUsuarioActual ?? false,
  })
}

/**
 * Obtiene una página del feed (`GET /publicaciones/feed`), compatible con `useInfiniteList` (T054).
 * Acepta un cursor (o número de página convertido a string) y opciones HTTP opcionales.
 */
export async function obtenerPagina(
  cursor: string | null,
  opciones?: HttpRequestOptions
): Promise<PaginaResultado<Publicacion>> {
  const queryParams: Record<string, string | number | undefined> = {}

  if (cursor) {
    const posibleNumero = Number(cursor)
    if (!Number.isNaN(posibleNumero) && Number.isInteger(posibleNumero) && posibleNumero > 0) {
      queryParams.page = posibleNumero
    } else {
      queryParams.cursor = cursor
    }
  }

  const respuesta = await httpClient.get<FeedResponseDto>(
    '/publicaciones/feed',
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
  const siguienteCursor =
    respuesta?.nextCursor !== undefined
      ? respuesta.nextCursor
      : nextPage !== null
      ? String(nextPage)
      : null

  return {
    items,
    nextPage,
    siguienteCursor,
    total: respuesta?.total,
  }
}

/**
 * Sobrecarga orientada a consulta con parámetros directos de paginación (`page`, `pageSize`).
 */
export async function obtenerFeed(
  opciones?: OpcionesFeed,
  requestOptions?: HttpRequestOptions
): Promise<PaginaResultado<Publicacion>> {
  const queryParams: Record<string, string | number | undefined> = {}

  if (opciones?.page !== undefined) {
    queryParams.page = opciones.page
  }
  if (opciones?.pageSize !== undefined) {
    queryParams.pageSize = opciones.pageSize
  }
  if (opciones?.cursor) {
    queryParams.cursor = opciones.cursor
  }

  const respuesta = await httpClient.get<FeedResponseDto>(
    '/publicaciones/feed',
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
  const siguienteCursor =
    respuesta?.nextCursor !== undefined
      ? respuesta.nextCursor
      : nextPage !== null
      ? String(nextPage)
      : null

  return {
    items,
    nextPage,
    siguienteCursor,
    total: respuesta?.total,
  }
}

export const feedService = {
  obtenerPagina,
  obtenerFeed,
}
