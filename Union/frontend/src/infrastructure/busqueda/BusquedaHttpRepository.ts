import type { BusquedaRepository } from '../../application/busqueda/BusquedaRepository'
import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import { TAMANO_PAGINA } from '../../domain/busqueda/constantes'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { ApiError, httpClient, type HttpRequestOptions } from '../httpClient'
import { mapearCatalogo, mapearError, mapearPagina } from './busquedaMappers'

/** Subconjunto de `httpClient` que usa el repositorio (permite un cliente falso en tests). */
export interface HttpClientBusqueda {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>
}

export const RUTA_FYP = '/feed/recomendaciones'
export const RUTA_BUSQUEDA = '/publicaciones/busqueda'
export const RUTA_CATALOGO = '/filtros/catalogo'

/** Nombre del query param del contrato para cada tipo de filtro con valores múltiples. */
const PARAM_POR_FILTRO: ReadonlyArray<readonly [TipoFiltro, string]> = [
  [TipoFiltro.ESTILO, 'estilo'],
  [TipoFiltro.TECNICA, 'tecnica'],
  [TipoFiltro.TIPO_ARTE, 'tipoArte'],
  [TipoFiltro.TIPO_CONTENIDO, 'tipoContenido'],
]

/**
 * Repositorio contra la API REST de búsqueda (contrato: contracts/openapi.yaml).
 * Usa las rutas de la API Java; las demostraciones en memoria requieren selección explícita.
 *
 * - Los arrays se serializan como claves repetidas dentro del path (el `httpClient`
 *   compartido solo admite `params` de clave única y no se modifica).
 * - DISTANCIA no se envía: la obtención de la ubicación por el backend está pendiente
 *   (A-02, `x-pending` en el contrato).
 */
export class BusquedaHttpRepository implements BusquedaRepository {
  constructor(private readonly http: HttpClientBusqueda = httpClient) {}

  async obtenerFyp(cursor?: string, signal?: AbortSignal, criterios?: CriteriosBusqueda): Promise<PaginaResultados> {
    // La API de recomendaciones no recibe filtros. La búsqueda admite q vacío y
    // devuelve el catálogo filtrado, con su propio cursor, sin filtrar una sola página localmente.
    if (criterios?.filtros.length) return this.buscar(criterios.limpiarTexto(), cursor, signal)
    const query = new URLSearchParams()
    this.agregarPaginacion(query, cursor)
    const raw = await this.obtener(RUTA_FYP, query, signal)
    if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { items?: unknown }).items)) return mapearPagina(raw)
    const pagina = raw as { items: Array<{ id: string; contenido: string; usuarioId: string; fotoUrl?: string; tipoContenido: string; estado: string }>; nextCursor?: string | null }
    return mapearPagina({
      items: pagina.items.map(p => ({ id: p.id, titulo: p.contenido,
        autor: { id: p.usuarioId, nombre: 'Ver autor' }, miniaturaUrl: p.fotoUrl ?? '',
        tipoContenido: p.tipoContenido,
        estado: p.estado })),
      cursorSiguiente: pagina.nextCursor ?? null,
    })
  }

  async buscar(
    criterios: CriteriosBusqueda,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<PaginaResultados> {
    const query = new URLSearchParams()
    query.append('q', criterios.texto)
    for (const [tipo, param] of PARAM_POR_FILTRO) {
      for (const valor of criterios.valoresDe(tipo)) query.append(param, valor)
    }
    this.agregarPaginacion(query, cursor)
    return mapearPagina(await this.obtener(RUTA_BUSQUEDA, query, signal))
  }

  async obtenerCatalogoFiltros(signal?: AbortSignal): Promise<CatalogoFiltros> {
    return mapearCatalogo(await this.obtener(RUTA_CATALOGO, new URLSearchParams(), signal))
  }

  private agregarPaginacion(query: URLSearchParams, cursor?: string): void {
    if (cursor !== undefined) query.append('cursor', cursor)
    query.append('limite', String(TAMANO_PAGINA))
  }

  private async obtener(
    ruta: string,
    query: URLSearchParams,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const qs = query.toString()
    try {
      return await this.http.get<unknown>(qs ? `${ruta}?${qs}` : ruta, { signal })
    } catch (error) {
      throw this.traducir(error)
    }
  }

  /** Cancelaciones se propagan sin cambios; el resto se tipa como `ErrorBusqueda`. */
  private traducir(error: unknown): unknown {
    if (error instanceof ErrorBusqueda) return error
    if (error instanceof DOMException && error.name === 'AbortError') return error
    if (error instanceof ApiError) {
      const cuerpo =
        typeof error.body === 'object' && error.body !== null
          ? (error.body as Record<string, unknown>)
          : null
      return mapearError(error.status, cuerpo)
    }
    if (error instanceof TypeError) return mapearError(null)
    return error
  }
}
