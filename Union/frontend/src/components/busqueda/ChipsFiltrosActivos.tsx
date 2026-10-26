import type { FiltroActivo } from '../../domain/busqueda/FiltroActivo'
import { FiltroChip } from '../filtros/FiltroChip'
import './busqueda.css'

export interface ChipsFiltrosActivosProps {
  filtros: readonly FiltroActivo[]
  /** Recibe el filtro exacto del chip (puede haber varios del mismo tipo). */
  onQuitar: (filtro: FiltroActivo) => void
  onLimpiarTodos: () => void
}

/**
 * Chips de los filtros activos (HU-03; RF-13, RF-14). Solo presenta y notifica.
 * Reutiliza `FiltroChip`; su callback entrega el tipo, que aquí se ignora porque
 * cada chip ya conoce su filtro.
 */
export function ChipsFiltrosActivos({
  filtros,
  onQuitar,
  onLimpiarTodos,
}: ChipsFiltrosActivosProps) {
  if (filtros.length === 0) return null

  return (
    <div className="chips-filtros">
      <ul className="chips-filtros__lista" aria-label="Filtros activos">
        {filtros.map((filtro) => (
          <li key={`${filtro.tipo}:${filtro.valor}`}>
            <FiltroChip
              tipo={filtro.tipo}
              valor={filtro.valor}
              onRemover={() => onQuitar(filtro)}
            />
          </li>
        ))}
      </ul>
      <button type="button" className="chips-filtros__limpiar" onClick={onLimpiarTodos}>
        Limpiar todos
      </button>
    </div>
  )
}
