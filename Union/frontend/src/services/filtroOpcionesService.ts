/**
 * Servicio de opciones de filtro para la pantalla Descubrir (HU-03).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /publicaciones/opciones-filtro`)
 * - Union/specs/001-plataforma-unificada/tasks.md (T053)
 *
 * Responsabilidad:
 * - Obtiene el catálogo de estilos, técnicas y tipos de contenido disponibles desde el backend.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { TipoContenido } from '../domain/enums/TipoContenido'

export interface OpcionesFiltroDto {
  estilos: string[]
  tecnicas: string[]
  tiposContenido?: TipoContenido[]
}

export interface OpcionesFiltro {
  estilos: string[]
  tecnicas: string[]
  tiposContenido: TipoContenido[]
}

/**
 * Obtiene las opciones de filtrado disponibles consultando `GET /publicaciones/opciones-filtro`.
 */
export async function obtenerOpcionesFiltro(
  options?: HttpRequestOptions
): Promise<OpcionesFiltro> {
  const respuesta = await httpClient.get<OpcionesFiltroDto>(
    '/publicaciones/opciones-filtro',
    options
  )

  return {
    estilos: Array.isArray(respuesta?.estilos) ? respuesta.estilos : [],
    tecnicas: Array.isArray(respuesta?.tecnicas) ? respuesta.tecnicas : [],
    tiposContenido: Array.isArray(respuesta?.tiposContenido)
      ? respuesta.tiposContenido
      : [
          TipoContenido.IMAGEN,
          TipoContenido.VIDEO,
          TipoContenido.MUSICA,
          TipoContenido.TUTORIAL,
          TipoContenido.ESCULTURA,
          TipoContenido.DIGITAL,
        ],
  }
}

export const filtroOpcionesService = {
  obtenerOpcionesFiltro,
}
