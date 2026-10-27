import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import type { BusquedaRepository } from './BusquedaRepository'

/**
 * Caso de uso: primera página del feed "Para ti" (FYP).
 * Se usa cuando `criterios.origen()` es FYP (sin texto buscable).
 *
 * Reenvía los criterios para aplicar filtros aunque la barra esté vacía.
 */
export class CargarFeedFyp {
  constructor(private readonly repositorio: BusquedaRepository) {}

  ejecutar(criterios: CriteriosBusqueda, signal?: AbortSignal): Promise<PaginaResultados> {
    return this.repositorio.obtenerFyp(undefined, signal, criterios)
  }
}
