import { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'

/** Qué hay que repetir al reintentar (T034c). */
export type AccionReintento = 'PRIMERA_PAGINA' | 'PAGINA_ADICIONAL' | null

/**
 * Decide qué operación repetir tras un error (CA-05.4):
 * - sin error pendiente → nada (no se consulta de nuevo);
 * - error con items ya cargados → la página adicional (mismo cursor, sin reiniciar la lista);
 * - error sin items → la primera página con los mismos criterios.
 */
export class ReintentarCarga {
  decidir(estado: { error: ErrorBusqueda | null; tienePagina: boolean }): AccionReintento {
    if (estado.error === null) return null
    return estado.tienePagina ? 'PAGINA_ADICIONAL' : 'PRIMERA_PAGINA'
  }
}

/** Convierte cualquier fallo en `ErrorBusqueda`; lo no tipado se expone como `SERVIDOR`. */
export function aErrorBusqueda(error: unknown): ErrorBusqueda {
  if (error instanceof ErrorBusqueda) return error
  return new ErrorBusqueda(
    TipoErrorBusqueda.SERVIDOR,
    error instanceof Error && error.message ? error.message : 'Ocurrió un error inesperado.',
    { causa: error },
  )
}
