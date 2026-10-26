import {
  type ContextoCriterios,
  type CriteriosBusqueda,
} from '../../domain/busqueda/CriteriosBusqueda'
import type { FiltroActivo } from '../../domain/busqueda/FiltroActivo'

/**
 * Caso de uso: agrega un filtro a los criterios (delega en `CriteriosBusqueda`).
 *
 * Si el filtro no es admisible en el contexto (DISTANCIA sin ubicación concedida, RF-21)
 * devuelve los mismos criterios, sin lanzar: no se agrega ni se enviará. La consulta de
 * admisión la resuelve `CriteriosBusqueda.admiteFiltro`; aquí no se duplica la regla.
 * Un filtro ya presente tampoco cambia los criterios (misma instancia).
 *
 * Reiniciar la paginación al cambiar los criterios es responsabilidad de `SesionBusqueda`,
 * que lo detecta con `CriteriosBusqueda.equivale`.
 */
export class AplicarFiltro {
  ejecutar(
    criterios: CriteriosBusqueda,
    filtro: FiltroActivo,
    contexto: ContextoCriterios = { ubicacionConcedida: false },
  ): CriteriosBusqueda {
    if (!criterios.admiteFiltro(filtro.tipo, contexto)) return criterios
    return criterios.conFiltro(filtro, contexto)
  }
}
