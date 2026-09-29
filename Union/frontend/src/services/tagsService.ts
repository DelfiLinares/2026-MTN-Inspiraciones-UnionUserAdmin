/**
 * Servicio de tags y autocompletado de vocabulario controlado.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-22)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /tags/autocompletado?q=...`)
 * - Union/specs/001-plataforma-unificada/tasks.md (T050)
 *
 * Responsabilidades:
 * - Autocompletado de tags desde el backend (`GET /tags/autocompletado?q=...`), que devuelve `{ items: string[] }`.
 * - Control de límite máximo de 10 tags por publicación (RF-22).
 * - Filtrado auxiliar en memoria y utilitarios para manejo de chips de tags.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'

export const LIMITE_MAXIMO_TAGS = 10

export interface TagAutocompletadoRespuesta {
  items: string[]
}

export interface Tag {
  id: string
  nombre: string
}

/**
 * Determina si se puede agregar un nuevo tag a la colección actual.
 * Máximo permitido: 10 tags por publicación (RF-22).
 */
export function puedeAgregarTag(tagsSeleccionados: string[]): boolean {
  return tagsSeleccionados.length < LIMITE_MAXIMO_TAGS
}

/**
 * Consulta el autocompletado de tags al backend mediante `GET /tags/autocompletado?q={query}`.
 * Devuelve un array de strings pertenecientes al vocabulario controlado provisto por el backend (RF-22).
 */
export async function autocompletarTags(
  query: string,
  options?: HttpRequestOptions
): Promise<string[]> {
  const queryLimpia = query.trim()
  if (!queryLimpia) {
    return []
  }

  const respuesta = await httpClient.get<TagAutocompletadoRespuesta>(
    '/tags/autocompletado',
    {
      ...options,
      params: {
        ...options?.params,
        q: queryLimpia,
      },
    }
  )

  return Array.isArray(respuesta?.items) ? respuesta.items : []
}

/**
 * Obtiene el catálogo completo de tags (para vistas con secciones o catálogo estático).
 */
export async function obtenerCatalogoTags(options?: HttpRequestOptions): Promise<Tag[]> {
  return httpClient.get<Tag[]>('/api/tags', options)
}

/**
 * Filtra en memoria un catálogo de tags por subcadena insensible a mayúsculas/minúsculas.
 */
export function filtrarTagsPorTexto(catalogo: Tag[], texto: string): Tag[] {
  const textoNormalizado = texto.trim().toLowerCase()
  if (textoNormalizado === '') {
    return catalogo
  }
  return catalogo.filter((tag) => tag.nombre.toLowerCase().includes(textoNormalizado))
}

export const tagsService = {
  LIMITE_MAXIMO_TAGS,
  puedeAgregarTag,
  autocompletarTags,
  obtenerCatalogoTags,
  filtrarTagsPorTexto,
}
