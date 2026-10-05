/**
 * `EstadoVacio`: Componente reutilizable para representar listados sin resultados.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T026)
 * - Union/specs/002-frontend-admin/spec.md CB-04
 *
 * Responsabilidades:
 * - Muestra un mensaje genérico (configurable) cuando un listado (usuarios, publicaciones,
 *   reportes) no tiene resultados, cumpliendo CB-04.
 * - Sin lógica de negocio: solo presentación.
 */

import React from 'react'

export interface EstadoVacioProps {
  readonly mensaje?: string
}

const MENSAJE_POR_DEFECTO = 'No hay resultados para mostrar.'

export const EstadoVacio: React.FC<EstadoVacioProps> = ({ mensaje = MENSAJE_POR_DEFECTO }) => {
  return (
    <div className="estado-vacio" role="status">
      <p className="estado-vacio__mensaje">{mensaje}</p>
    </div>
  )
}
