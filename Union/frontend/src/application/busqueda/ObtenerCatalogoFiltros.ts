import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { BusquedaRepository } from './BusquedaRepository'
import { aErrorBusqueda } from './ReintentarCarga'

/**
 * Resultado local de la carga del catálogo: nunca afecta a la sesión de búsqueda ni al feed
 * (el panel de filtros muestra su propio error con "reintentar").
 */
export type ResultadoCatalogo =
  | { readonly ok: true; readonly catalogo: CatalogoFiltros }
  | { readonly ok: false; readonly error: ErrorBusqueda }

/**
 * Caso de uso: obtener el catálogo de filtros (T036).
 * El fallo se devuelve como valor (`ok: false`) en lugar de lanzarse, para que la UI lo trate
 * como error local del panel. La cancelación (`AbortError`) sí se propaga: el llamador que
 * canceló no espera resultado.
 */
export class ObtenerCatalogoFiltros {
  constructor(private readonly repositorio: BusquedaRepository) {}

  async ejecutar(signal?: AbortSignal): Promise<ResultadoCatalogo> {
    try {
      const catalogo = await this.repositorio.obtenerCatalogoFiltros(signal)
      return { ok: true, catalogo }
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error
      return { ok: false, error: aErrorBusqueda(error) }
    }
  }
}
