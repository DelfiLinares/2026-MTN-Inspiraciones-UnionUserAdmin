/**
 * Servicio de búsqueda y filtrado de publicaciones (pantalla Descubrir, HU-03).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40, RF-41, RF-43, RF-44, RNF-05)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /publicaciones`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T052)
 *
 * Reglas clave:
 * - Resuelve búsqueda y filtros SIEMPRE contra la API (`GET /publicaciones`), NUNCA en memoria (RNF-05).
 * - Soporta parámetros de consulta: `q`, `estilo`, `tecnica`, `tipoContenido`, `distanciaKm`, `lat`, `lon`, `page`, `pageSize`, `cursor`.
 * - Devuelve publicaciones mapeadas a entidades de dominio `Publicacion`.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import { Filtro } from '../domain/Filtro'

export interface PublicacionDto {
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

export interface BusquedaPublicacionesRespuestaDto {
  items: PublicacionDto[]
  nextPage?: number | null
  nextCursor?: string | null
  total?: number
}

export interface PaginaResultadoBusqueda<T> {
  items: T[]
  nextPage: number | null
  siguienteCursor: string | null
  total?: number
}

export interface CoordenadasUbicacion {
  latitud: number
  longitud: number
}

export interface ParametrosBusquedaOpciones {
  pagina?: number
  tamanoPagina?: number
  cursor?: string | null
  coordenadas?: CoordenadasUbicacion | null
}

function mapearPublicacion(dto: PublicacionDto): Publicacion {
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
 * Realiza la búsqueda y filtrado de publicaciones invocando `GET /publicaciones`.
 * Cumple con RNF-05 y RF-40: la resolución de criterios se delega estrictamente al backend.
 */
export async function buscarPublicaciones(
  filtro: Filtro,
  opciones?: ParametrosBusquedaOpciones,
  requestOptions?: HttpRequestOptions
): Promise<PaginaResultadoBusqueda<Publicacion>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {}

  // 1. Mapeo de criterios del dominio Filtro
  if (filtro.texto && filtro.texto.trim() !== '') {
    queryParams.q = filtro.texto.trim()
  }

  if (filtro.estilo && filtro.estilo.trim() !== '') {
    queryParams.estilo = filtro.estilo.trim()
  }

  if (filtro.tecnica && filtro.tecnica.trim() !== '') {
    queryParams.tecnica = filtro.tecnica.trim()
  }

  if (filtro.tipoContenido) {
    queryParams.tipoContenido = filtro.tipoContenido
  }

  // Filtro de distancia solo si la geolocalización está habilitada (RF-45)
  if (filtro.distanciaKm !== undefined && filtro.distanciaHabilitada()) {
    queryParams.distanciaKm = filtro.distanciaKm
  }

  // Coordenadas geográficas si están disponibles
  if (opciones?.coordenadas && filtro.distanciaHabilitada()) {
    queryParams.lat = opciones.coordenadas.latitud
    queryParams.lon = opciones.coordenadas.longitud
  }

  // 2. Mapeo de paginación (soporte de page / pageSize y cursor opaco)
  if (opciones?.pagina !== undefined) {
    queryParams.page = opciones.pagina
  }
  if (opciones?.tamanoPagina !== undefined) {
    queryParams.pageSize = opciones.tamanoPagina
  }
  if (opciones?.cursor) {
    queryParams.cursor = opciones.cursor
  }

  const respuesta = await httpClient.get<BusquedaPublicacionesRespuestaDto>(
    '/publicaciones',
    {
      ...requestOptions,
      params: {
        ...queryParams,
        ...requestOptions?.params,
      },
    }
  )

  const rawItems = Array.isArray(respuesta?.items) ? respuesta.items : []
  const items = rawItems.map(mapearPublicacion)
  const nextPage = respuesta?.nextPage ?? null
  const siguienteCursor = respuesta?.nextCursor ?? null

  return {
    items,
    nextPage,
    siguienteCursor,
    total: respuesta?.total,
  }
}

export const busquedaService = {
  buscarPublicaciones,
}
