/**
 * `AccionSensibleBoton`: Botón reutilizable con estilo visual diferenciado para acciones sensibles
 * (destructivas/irreversibles) vs. acciones de consulta.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T025)
 * - Union/specs/002-frontend-admin/spec.md RF-22, RNF-03
 *
 * Responsabilidades:
 * - Aplica una clase CSS distinta según `sensible` (true → estilo de advertencia/peligro; false →
 *   estilo neutro de consulta), cumpliendo RF-22/RNF-03 (diferenciación visual de acciones
 *   destructivas respecto de las de solo consulta).
 * - Sin lógica de negocio ni de confirmación: delega la confirmación explícita a `ConfirmDialog`
 *   (T024), que es invocado por el componente consumidor (p. ej. `BanearUsuarioAction`, T036).
 */

import React from 'react'

export interface AccionSensibleBotonProps {
  readonly etiqueta: string
  readonly sensible: boolean
  readonly onClick: () => void
  readonly deshabilitado?: boolean
}

export const AccionSensibleBoton: React.FC<AccionSensibleBotonProps> = ({
  etiqueta,
  sensible,
  onClick,
  deshabilitado = false,
}) => {
  const clase = sensible
    ? 'accion-sensible-boton accion-sensible-boton--sensible'
    : 'accion-sensible-boton accion-sensible-boton--consulta'

  return (
    <button
      type="button"
      className={clase}
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiqueta}
    >
      {etiqueta}
    </button>
  )
}
