/**
 * Componente `InfiniteScrollList`: Envoltorio genérico para listas con paginación infinita.
 * Integra el centinela con `IntersectionObserver` y renderiza estados de carga, vacío y
 * el indicador explícito de fin de resultados (CB-05).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, CB-05)
 * - Union/specs/001-plataforma-unificada/tasks.md (T083)
 */

import React from 'react'
import { Spinner } from './Spinner'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'

export interface InfiniteScrollListProps<T> {
  items: T[]
  cargando: boolean
  hayMas: boolean
  finDeResultados?: boolean
  error?: unknown
  centinelaRef: (nodo: Element | null) => void
  renderItem: (item: T, index: number) => React.ReactNode
  claveItem?: (item: T, index: number) => string | number
  mensajeVacio?: string
  tituloVacio?: string
  layoutGrid?: boolean
  esquemaSkeleton?: 'tarjeta' | 'texto' | 'rectangular'
}

export function InfiniteScrollList<T>({
  items,
  cargando,
  hayMas,
  finDeResultados,
  error,
  centinelaRef,
  renderItem,
  claveItem,
  mensajeVacio = 'No hay publicaciones para mostrar.',
  tituloVacio = 'Sin resultados',
  layoutGrid = true,
  esquemaSkeleton = 'tarjeta',
}: InfiniteScrollListProps<T>): React.ReactElement {
  const mostrarFinDeResultados = finDeResultados ?? (!hayMas && items.length > 0)

  return (
    <div className="w-full space-y-4">
      {/* Listado principal */}
      {items.length > 0 && (
        <div className={layoutGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {items.map((item, index) => {
            const key = claveItem ? claveItem(item, index) : (item as any)?.id ?? index
            return <React.Fragment key={key}>{renderItem(item, index)}</React.Fragment>
          })}
        </div>
      )}

      {/* Estado vacio cuando no hay items y ya no está cargando */}
      {!cargando && items.length === 0 && !error && (
        <EmptyState titulo={tituloVacio} mensaje={mensajeVacio} />
      )}

      {/* Estado de error en la lista */}
      {error != null && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 text-center">
          Ocurrió un error al cargar los datos. Por favor intentá nuevamente.
        </div>
      )}

      {/* Spinner de carga o Skeleton inicial/siguiente pagina */}
      {cargando && (
        items.length === 0 ? (
          <Skeleton variante={esquemaSkeleton} cantidad={3} />
        ) : (
          <div className="py-4 flex justify-center">
            <Spinner tamano="sm" texto="Cargando más resultados..." />
          </div>
        )
      )}

      {/* Indicador explicito de fin de resultados (CB-05) */}
      {mostrarFinDeResultados && !cargando && (
        <div className="py-6 text-center text-xs font-medium text-gray-400 border-t border-gray-100">
          — Has alcanzado el final de los resultados —
        </div>
      )}

      {/* Nodo centinela invisible para IntersectionObserver */}
      {hayMas && !cargando && (
        <div ref={centinelaRef} className="h-4 w-full opacity-0 pointer-events-none" />
      )}
    </div>
  )
}
