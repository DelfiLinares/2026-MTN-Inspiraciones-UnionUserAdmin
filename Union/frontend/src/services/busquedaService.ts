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
 *
 * Adaptador HTTP para seguimiento (T060):
 * - Fuente de verdad: Union/specs/004-inspiraciones-perfil/spec.md (HU-04, A4)
 * - Implementa SeguimientoRepository para toggle de seguimiento (HU-04)
 * - Soporta optimistic update + rollback
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import { SeguimientoRelacion } from '../domain/SeguimientoRelacion'
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

/**
 * DTOs para operaciones de seguimiento (T060, HU-04).
 */

/**
 * DTO del API HTTP para obtener estado de seguimiento.
 */
interface EstadoSeguimientoResponseDto {
  usuarioId: string
  usuarioASeguidoId: string
  siguiendo: boolean
}

/**
 * DTO del API HTTP para toggle de seguimiento.
 * Retorna el nuevo estado tras toggle.
 */
interface ToggleSeguimientoResponseDto {
  usuarioId: string
  usuarioASeguidoId: string
  ahora_siguiendo: boolean
  timestamp?: string
}

/**
 * Mapear DTO HTTP a entidad SeguimientoRelacion de dominio.
 */
function mapearSeguimientoDelDto(dto: EstadoSeguimientoResponseDto): SeguimientoRelacion {
  return new SeguimientoRelacion(
    dto.usuarioId,
    dto.usuarioASeguidoId,
    dto.siguiendo,
  )
}

/**
 * HU-04: Obtener estado de seguimiento actual entre dos usuarios.
 *
 * Invoca GET /seguimientos/{usuarioId}/{usuarioASeguidoId} contra el backend.
 *
 * @param usuarioActualId — ID del usuario autenticado
 * @param usuarioASeguidoId — ID del usuario cuyo estado de seguimiento se consulta
 * @returns SeguimientoRelacion con estado actual (true si sigue, false si no)
 * @throws Error si falla la llamada HTTP
 */
export async function obtenerEstadoSeguimiento(
  usuarioActualId: string,
  usuarioASeguidoId: string,
  requestOptions?: HttpRequestOptions
): Promise<SeguimientoRelacion> {
  const respuesta = await httpClient.get<EstadoSeguimientoResponseDto>(
    `/seguimientos/${usuarioActualId}/${usuarioASeguidoId}`,
    requestOptions
  )
  return mapearSeguimientoDelDto(respuesta)
}

/**
 * HU-04 + A4: Toggle de seguimiento (seguir / dejar de seguir).
 *
 * Invoca POST/PUT /seguimientos/{usuarioId}/{usuarioASeguidoId} contra el backend.
 * Alterna el estado: si seguía, deja de seguir; si no seguía, sigue.
 *
 * Soporta optimistic update desde SeguimientoService:
 * - UI actualiza estado localmente de inmediato
 * - Si éxito: Confirma estado
 * - Si error: Revierte estado (rollback)
 *
 * @param usuarioActualId — ID del usuario autenticado que ejecuta
 * @param usuarioASeguidoId — ID del usuario a seguir/dejar de seguir
 * @returns Objeto con nuevo estado tras toggle
 * @throws Error si falla la llamada HTTP (401, 403, 404, etc.)
 */
export async function toggleSeguimiento(
  usuarioActualId: string,
  usuarioASeguidoId: string,
  requestOptions?: HttpRequestOptions
): Promise<{ usuarioId: string; usuarioASeguidoId: string; ahora_siguiendo: boolean }> {
  const respuesta = await httpClient.post<ToggleSeguimientoResponseDto>(
    `/seguimientos/${usuarioActualId}/${usuarioASeguidoId}/toggle`,
    {},
    requestOptions
  )
  return {
    usuarioId: respuesta.usuarioId,
    usuarioASeguidoId: respuesta.usuarioASeguidoId,
    ahora_siguiendo: respuesta.ahora_siguiendo,
  }
}

/**
 * Objeto exportado con funciones de seguimiento.
 * Permite acceso a través de seguimientoService.obtenerEstadoSeguimiento(...).
 */
export const seguimientoService = {
  obtenerEstadoSeguimiento,
  toggleSeguimiento,
}
