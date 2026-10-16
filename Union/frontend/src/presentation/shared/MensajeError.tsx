/**
 * `MensajeError`: Componente reutilizable (no bloqueante) para mostrar errores de operaciones
 * fallidas.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T027)
 * - Union/specs/002-frontend-admin/spec.md AC-01.7, AC-02.6, AC-03.6, AC-05.5, AC-07.5, AC-08.5, CB-06
 *
 * Responsabilidades:
 * - Muestra un mensaje de error de forma no bloqueante (no es un modal ni interrumpe el flujo),
 *   cumpliendo CB-06 y los criterios de aceptación referidos.
 * - Sin lógica de negocio: solo presentación. El consumidor decide cuándo renderizarlo (p. ej. tras
 *   una operación fallida de `UsuariosService`, `PublicacionesService`, `ReportesService`, etc.).
 */

import React from 'react'

export interface MensajeErrorProps {
  readonly mensaje: string
}

export const MensajeError: React.FC<MensajeErrorProps> = ({ mensaje }) => {
  return (
    <div className="mensaje-error" role="alert">
      <p className="mensaje-error__texto">{mensaje}</p>
    </div>
  )
}
