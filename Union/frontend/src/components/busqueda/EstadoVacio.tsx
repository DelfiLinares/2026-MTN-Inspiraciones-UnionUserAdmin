import { MENSAJES_VACIO } from './mensajes'
import './busqueda.css'

export interface EstadoVacioProps {
  hayFiltros: boolean
  onLimpiarFiltros?: () => void
}

export function EstadoVacio({ hayFiltros, onLimpiarFiltros }: EstadoVacioProps) {
  return (
    <div className="estado-busqueda estado-busqueda--vacio" role="status">
      <p>{MENSAJES_VACIO.titulo}</p>
      {hayFiltros && onLimpiarFiltros ? (
        <>
          <p>{MENSAJES_VACIO.sugerencia}</p>
          <button type="button" onClick={onLimpiarFiltros}>
            {MENSAJES_VACIO.limpiarFiltros}
          </button>
        </>
      ) : null}
    </div>
  )
}
