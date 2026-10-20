import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import type { BusquedaRepository } from './BusquedaRepository'

/**
 * Caso de uso: primera página del feed "Para ti" (FYP).
 * Se usa cuando `criterios.origen()` es FYP (sin texto buscable).
 *
 * Limitación conocida: `plan.md` indica que los filtros se envían si existen, pero el puerto
 * `BusquedaRepository.obtenerFyp(cursor?, signal?)` (T019) no recibe criterios. Por eso hoy
 * los filtros NO se reenvían al FYP. `criterios` ya forma parte de la firma para poder
 * incorporarlos sin cambiar a los llamadores cuando se resuelva la inconsistencia.
 */
export class CargarFeedFyp {
  constructor(private readonly repositorio: BusquedaRepository) {}

  ejecutar(_criterios: CriteriosBusqueda, signal?: AbortSignal): Promise<PaginaResultados> {
    return this.repositorio.obtenerFyp(undefined, signal)
  }
}
