import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import { OrigenFeed } from '../../domain/enums/OrigenFeed'
import type { BusquedaRepository } from './BusquedaRepository'

export interface EntradaCargarMas {
  criterios: CriteriosBusqueda
  /** Última página cargada: de ahí sale el cursor y si hay más resultados. */
  pagina: PaginaResultados
  /** `true` si ya hay una carga (inicial o adicional) en curso. */
  cargando: boolean
  signal?: AbortSignal
}

/**
 * Caso de uso: siguiente página del feed o de la búsqueda, según `criterios.origen()`.
 *
 * Rechaza la operación (devuelve `null` sin consultar al repositorio) si hay una carga en
 * curso o si `pagina.hayMas` es falso (RF-08). No fusiona con la página anterior ni
 * deduplica: eso lo hace `PaginaResultados.agregar` desde `SesionBusqueda`.
 */
export class CargarMasResultados {
  constructor(private readonly repositorio: BusquedaRepository) {}

  async ejecutar(entrada: EntradaCargarMas): Promise<PaginaResultados | null> {
    const { criterios, pagina, cargando, signal } = entrada
    if (cargando || !pagina.hayMas || pagina.cursorSiguiente === null) return null

    return criterios.origen() === OrigenFeed.BUSQUEDA
      ? this.repositorio.buscar(criterios, pagina.cursorSiguiente, signal)
      : this.repositorio.obtenerFyp(pagina.cursorSiguiente, signal)
  }
}
