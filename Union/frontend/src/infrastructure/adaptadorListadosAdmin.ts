/** Compatibilidad de los listados administrativos con la paginación base cero de la API. */
import type { HttpRequestOptions } from '../application/ports/HttpClient'

function esListado(path: string) {
  return path === '/admin/usuarios' || path === '/admin/publicaciones'
}

export function opcionesListadoAdmin(path: string, options?: HttpRequestOptions): HttpRequestOptions | undefined {
  if (!esListado(path)) return options
  const { q, page, pageSize, ...resto } = options?.params ?? {}
  return { ...options, params: {
    ...resto,
    ...(q !== undefined ? { texto: q } : {}),
    ...(page !== undefined ? { pagina: Math.max(0, Number(page) - 1) } : {}),
    ...(pageSize !== undefined ? { tamanio: pageSize } : {}),
  } }
}

export function respuestaListadoAdmin<T>(path: string, respuesta: T): T {
  if (!esListado(path) || !respuesta || typeof respuesta !== 'object') return respuesta
  const pagina = respuesta as Record<string, unknown>
  if (!Array.isArray(pagina.contenido)) return respuesta
  return { ...pagina, items: pagina.contenido, total: pagina.totalElementos ?? pagina.contenido.length } as T
}
