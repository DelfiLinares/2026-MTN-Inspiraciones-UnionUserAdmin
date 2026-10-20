import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { PaginaResultados } from '../../domain/busqueda/PaginaResultados'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'
import type { BusquedaRepository } from './BusquedaRepository'

/**
 * Caso de uso: primera página de resultados de búsqueda (texto buscable y filtros).
 * La decisión FYP vs búsqueda es de `CriteriosBusqueda.origen()`; si se invoca sin texto
 * buscable (< 2 caracteres) falla con `SOLICITUD_INVALIDA` en lugar de enviar a la API un
 * `q` que el contrato rechazaría (minLength 2).
 */
export class BuscarPublicaciones {
  constructor(private readonly repositorio: BusquedaRepository) {}

  ejecutar(criterios: CriteriosBusqueda, signal?: AbortSignal): Promise<PaginaResultados> {
    if (!criterios.esBuscable()) {
      return Promise.reject(
        new ErrorBusqueda(
          TipoErrorBusqueda.SOLICITUD_INVALIDA,
          'La búsqueda requiere al menos 2 caracteres.',
          { codigo: 'TEXTO_NO_BUSCABLE' },
        ),
      )
    }
    return this.repositorio.buscar(criterios, undefined, signal)
  }
}
