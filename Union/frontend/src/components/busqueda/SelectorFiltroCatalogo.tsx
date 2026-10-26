import './busqueda.css'

export interface OpcionSelector {
  valor: string
  etiqueta: string
}

export interface SelectorFiltroCatalogoProps {
  /** Nombre visible del grupo (leyenda del fieldset). */
  titulo: string
  opciones: readonly OpcionSelector[]
  /** Valores actualmente activos de este tipo de filtro. */
  seleccionados: readonly string[]
  /** `marcado` es el nuevo estado del checkbox. */
  onCambiar: (valor: string, marcado: boolean) => void
  deshabilitado?: boolean
  /** Texto informativo bajo la leyenda (p. ej. por qué está deshabilitado). */
  aviso?: string
}

/**
 * Grupo de opciones de selección múltiple (un checkbox por opción).
 * Solo presenta: no decide reglas; informa cada cambio a quien lo usa.
 */
export function SelectorFiltroCatalogo({
  titulo,
  opciones,
  seleccionados,
  onCambiar,
  deshabilitado = false,
  aviso,
}: SelectorFiltroCatalogoProps) {
  return (
    <fieldset className="selector-filtro" disabled={deshabilitado}>
      <legend className="selector-filtro__titulo">{titulo}</legend>
      {aviso ? <p className="selector-filtro__aviso">{aviso}</p> : null}
      <ul className="selector-filtro__opciones">
        {opciones.map((opcion) => (
          <li key={opcion.valor}>
            <label className="selector-filtro__opcion">
              <input
                type="checkbox"
                checked={seleccionados.includes(opcion.valor)}
                disabled={deshabilitado}
                onChange={(evento) => {
                  if (deshabilitado) return
                  onCambiar(opcion.valor, evento.target.checked)
                }}
              />
              <span>{opcion.etiqueta}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
