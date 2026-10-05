/**
 * `EstadoModeracionBadge`: Indicador visual del estado de moderación de un reporte.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T055, depende de T011, T013)
 * - Union/specs/002-frontend-admin/spec.md AC-06.3, RNF-02
 *
 * Responsabilidades:
 * - Renderiza una insignia (`<span>` con clase `badge`) cuyo color varía según el valor de
 *   `EstadoModeracion` (T011). Los reportes en estado `PENDIENTE` se destacan visualmente de forma
 *   clara y rápida frente a los demás estados (AC-06.3, RNF-02), mediante un color más llamativo y
 *   un borde adicional (`box-shadow`).
 * - Componente de presentación puro, sin estado ni lógica de negocio.
 */

import React from 'react'
import { EstadoModeracion } from '../../domain/enums/EstadoModeracion'

export interface EstadoModeracionBadgeProps {
  readonly estado: EstadoModeracion
}

const CLASE_POR_ESTADO: Record<EstadoModeracion, string> = {
  [EstadoModeracion.PENDIENTE]: 'badge--estado-pendiente',
  [EstadoModeracion.EN_REVISION]: 'badge--estado-en-revision',
  [EstadoModeracion.RESUELTO]: 'badge--estado-resuelto',
  [EstadoModeracion.DESESTIMADO]: 'badge--estado-desestimado',
}

export const EstadoModeracionBadge: React.FC<EstadoModeracionBadgeProps> = ({ estado }) => {
  return (
    <span className={`badge ${CLASE_POR_ESTADO[estado]}`} aria-label={`Estado de moderación ${estado}`}>
      {estado}
    </span>
  )
}
