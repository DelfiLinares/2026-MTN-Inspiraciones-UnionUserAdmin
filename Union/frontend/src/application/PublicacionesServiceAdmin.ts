/**
 * Servicio de aplicación `PublicacionesServiceAdmin` del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T042a: `listar()`, depende de T010, T018, T041;
 *   T042b: `editar()`, depende de T010, T018, T042a, hace pasar la porción "editar" de T041;
 *   T042c: `eliminar()`, depende de T010, T018, T042a, hace pasar la porción "eliminar" de T041)
 * - Union/specs/002-frontend-admin/spec.md RF-09, RF-10, RF-11, RF-12, CB-06
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml
 *   (`GET /publicaciones`, `PATCH /publicaciones/{id}`, `POST /publicaciones/{id}/eliminar`)
 *
 * Responsabilidades:
 * - `listar(filtros)`: Búsqueda paginada de publicaciones (`GET /publicaciones`), con filtro por
 *   estado (`EstadoPublicacion`, T010).
 * - `editar(publicacion, cambios)`: Delega `publicacion.puedeSerEditada()` a la entidad
 *   `PublicacionModeracion` (T018) antes de invocar el `HttpClient`. Si la operación falla (CB-06),
 *   el error se propaga sin aplicar cambios parciales localmente (no hay estado mutable en este
 *   servicio: la entidad `PublicacionModeracion` es inmutable).
 * - `eliminar(publicacion)`: Delega `publicacion.puedeSerEliminada()` a la entidad
 *   `PublicacionModeracion` antes de invocar el `HttpClient`.
 */

import type { HttpClient } from '../infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../infrastructure/apiEndpointsAdmin'
import { PublicacionModeracion } from '../domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from '../domain/enums/MotivoReporteAdmin'

export const MENSAJE_PUBLICACION_NO_EDITABLE =
  'La publicación no puede ser editada en su estado actual.'

export const MENSAJE_PUBLICACION_NO_ELIMINABLE =
  'La publicación no puede ser eliminada en su estado actual.'

export class PublicacionNoEditableError extends Error {
  constructor(mensaje = MENSAJE_PUBLICACION_NO_EDITABLE) {
    super(mensaje)
    this.name = 'PublicacionNoEditableError'
  }
}

export class PublicacionNoEliminableError extends Error {
  constructor(mensaje = MENSAJE_PUBLICACION_NO_ELIMINABLE) {
    super(mensaje)
    this.name = 'PublicacionNoEliminableError'
  }
}

export interface PublicacionModeracionDto {
  id: string
  autorId: string
  estado: string
  cantidadReportes: number
  motivosReporte: string[]
}

export interface ListarPublicacionesFiltros {
  page?: number
  pageSize?: number
  estado?: EstadoPublicacion
}

export interface PaginaPublicacionesAdmin {
  items: PublicacionModeracion[]
  total: number
}

export interface CambiosEdicionPublicacion {
  contenido?: string
}

function mapearPublicacionModeracion(dto: PublicacionModeracionDto): PublicacionModeracion {
  return new PublicacionModeracion({
    id: dto.id,
    autorId: dto.autorId,
    estado: (dto.estado as EstadoPublicacion) || EstadoPublicacion.ACTIVA,
    cantidadReportes: dto.cantidadReportes ?? 0,
    motivosReporte: (dto.motivosReporte as MotivoReporte[]) ?? [],
  })
}

interface RespuestaListaPublicacionesDto {
  items: PublicacionModeracionDto[]
  total: number
}

export class PublicacionesServiceAdmin {
  constructor(private readonly client: HttpClient) {}

  /**
   * T042a: Búsqueda paginada de publicaciones (`GET /publicaciones`, RF-11).
   */
  async listar(filtros: ListarPublicacionesFiltros = {}): Promise<PaginaPublicacionesAdmin> {
    const params: Record<string, string | number | boolean | undefined> = {
      page: filtros.page ?? 1,
      pageSize: filtros.pageSize ?? 10,
      estado: filtros.estado,
    }

    const respuesta = await this.client.get<RespuestaListaPublicacionesDto>(
      apiEndpointsAdmin.publicaciones(),
      { params }
    )

    const items = Array.isArray(respuesta.items) ? respuesta.items.map(mapearPublicacionModeracion) : []
    const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

    return { items, total }
  }

  /**
   * T042b: Edita el contenido de una publicación (`PATCH /publicaciones/{id}`, RF-09).
   * Valida `publicacion.puedeSerEditada()` antes de invocar el `HttpClient`. Si la operación falla
   * (CB-06), el error se propaga sin aplicar cambios parciales.
   */
  async editar(publicacion: PublicacionModeracion, cambios: CambiosEdicionPublicacion): Promise<void> {
    if (!publicacion.puedeSerEditada()) {
      throw new PublicacionNoEditableError()
    }

    await this.client.patch<void>(apiEndpointsAdmin.publicacion(publicacion.id), cambios)
  }

  /**
   * T042c: Elimina una publicación (`POST /publicaciones/{id}/eliminar`, RF-10).
   * Valida `publicacion.puedeSerEliminada()` antes de invocar el `HttpClient`.
   */
  async eliminar(publicacion: PublicacionModeracion): Promise<void> {
    if (!publicacion.puedeSerEliminada()) {
      throw new PublicacionNoEliminableError()
    }

    await this.client.post<void>(apiEndpointsAdmin.eliminarPublicacion(publicacion.id), undefined)
  }
}
