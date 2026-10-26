import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'

/**
 * Caso de uso: quita todos los filtros y conserva el texto
 * (delega en `CriteriosBusqueda.limpiarFiltros`).
 * Sin filtros activos los criterios resultantes son equivalentes a los recibidos.
 */
export class LimpiarFiltros {
  ejecutar(criterios: CriteriosBusqueda): CriteriosBusqueda {
    return criterios.limpiarFiltros()
  }
}
