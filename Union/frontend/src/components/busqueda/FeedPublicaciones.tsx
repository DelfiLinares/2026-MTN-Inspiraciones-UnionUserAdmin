import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import { TipoErrorBusqueda } from '../../domain/enums/TipoErrorBusqueda'
import { AvisoSinPermiso } from './AvisoSinPermiso'
import { EstadoError } from './EstadoError'
import { EstadoVacio } from './EstadoVacio'
import { EsqueletoTarjetas } from './EsqueletoTarjetas'
import { GrillaPublicaciones } from './GrillaPublicaciones'
import { PieCarga } from './PieCarga'
import './busqueda.css'

export interface FeedPublicacionesProps {
  readonly items: readonly PublicacionResumen[]
  readonly hayMas: boolean
  readonly cargando: boolean
  readonly onCargarMas: () => void
  readonly error?: ErrorBusqueda | null
  readonly hayFiltros?: boolean
  readonly onLimpiarFiltros?: () => void
  readonly onReintentar?: () => void
}

export function FeedPublicaciones({
  items,
  hayMas,
  cargando,
  onCargarMas,
  error = null,
  hayFiltros = false,
  onLimpiarFiltros,
  onReintentar,
}: FeedPublicacionesProps) {
  if (error !== null && error.esReintentable && !onReintentar) {
    throw new Error('FeedPublicaciones requiere onReintentar cuando recibe un error reintentable.')
  }
  if (items.length === 0 && !cargando && error === null && hayFiltros && !onLimpiarFiltros) {
    throw new Error('FeedPublicaciones requiere onLimpiarFiltros cuando hay filtros activos.')
  }

  return (
    <section className="feed-publicaciones" aria-label="Feed de publicaciones">
      {items.length > 0 ? <GrillaPublicaciones items={items} /> : null}

      {error?.tipo === TipoErrorBusqueda.SIN_PERMISO ? <AvisoSinPermiso /> : null}
      {error !== null && error.tipo !== TipoErrorBusqueda.SIN_PERMISO ? (
        <EstadoError error={error} onReintentar={onReintentar!} />
      ) : null}

      {items.length === 0 && cargando ? <EsqueletoTarjetas /> : null}
      {items.length === 0 && !cargando && error === null ? (
        <EstadoVacio hayFiltros={hayFiltros} onLimpiarFiltros={onLimpiarFiltros} />
      ) : null}

      <PieCarga
        hayMas={hayMas && error === null}
        cargando={cargando && items.length > 0}
        onCargarMas={onCargarMas}
      />
    </section>
  )
}
