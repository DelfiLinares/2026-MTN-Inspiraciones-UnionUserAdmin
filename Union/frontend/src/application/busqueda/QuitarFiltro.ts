import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { FiltroActivo } from '../../domain/busqueda/FiltroActivo'

/**
 * Caso de uso: quita un filtro de los criterios (delega en `CriteriosBusqueda.sinFiltro`).
 * Si el filtro no estaba activo, los criterios resultantes son equivalentes a los recibidos
 * (`equivale`), por lo que `SesionBusqueda` no reinicia la paginación.
 */
export class QuitarFiltro {
  ejecutar(criterios: CriteriosBusqueda, filtro: FiltroActivo): CriteriosBusqueda {
    return criterios.sinFiltro(filtro)
  }
}
