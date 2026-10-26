import { useInfiniteScrollSentinel } from '../../pages/busqueda/useInfiniteScrollSentinel'
import { EsqueletoTarjetas } from './EsqueletoTarjetas'
import { MENSAJES_CARGA } from './mensajes'
import './busqueda.css'

export interface PieCargaProps {
  readonly hayMas: boolean
  readonly cargando: boolean
  readonly onCargarMas: () => void
}

export function PieCarga({ hayMas, cargando, onCargarMas }: PieCargaProps) {
  const centinelaRef = useInfiniteScrollSentinel<HTMLDivElement>(onCargarMas, {
    habilitado: hayMas && !cargando,
  })

  if (!hayMas) return null

  return (
    <div className="pie-carga">
      {cargando ? (
        <EsqueletoTarjetas cantidad={1} />
      ) : (
        <button type="button" onClick={onCargarMas}>
          {MENSAJES_CARGA.cargarMas}
        </button>
      )}
      <div
        ref={centinelaRef}
        className="pie-carga__centinela"
        data-testid="feed-centinela"
        aria-hidden="true"
      />
    </div>
  )
}
