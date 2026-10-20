import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'

/**
 * Puerto de acceso a la API de búsqueda/FYP (módulo 007).
 * Los fallos se señalan con `ErrorBusqueda` (domain/busqueda/ErrorBusqueda).
 * El orden y contenido de los resultados lo decide la API.
 */
export interface BusquedaRepository {
  /** Feed "Para ti" (sin texto ni filtros). `cursor` ausente = primera página. */
  obtenerFyp(cursor?: string, signal?: AbortSignal): Promise<PaginaResultados>

  /** Búsqueda por texto y/o filtros. `cursor` ausente = primera página. */
  buscar(
    criterios: CriteriosBusqueda,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<PaginaResultados>

  /** Catálogo de valores disponibles para los filtros dinámicos. */
  obtenerCatalogoFiltros(signal?: AbortSignal): Promise<CatalogoFiltros>
}
