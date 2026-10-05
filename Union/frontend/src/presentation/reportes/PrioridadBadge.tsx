/**
 * `PrioridadBadge`: Indicador visual de la prioridad de un reporte.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T055, depende de T011, T013)
 * - Union/specs/002-frontend-admin/spec.md AC-06.3, RNF-02
 *
 * Responsabilidades:
 * - Renderiza una insignia (`<span>` con clase `badge`) cuyo color varía según el valor de
 *   `PrioridadReporte` (T013): `ALTA` (rojo), `MEDIA` (ámbar), `BAJA` (gris), apoyando la
 *   localización rápida de reportes según su prioridad (RNF-02).
 * - Componente de presentación puro, sin estado ni lógica de negocio.
 */

import React from 'react'
import { PrioridadReporte } from '../../domain/enums/PrioridadReporte'

export interface PrioridadBadgeProps {
  readonly prioridad: PrioridadReporte
}

const CLASE_POR_PRIORIDAD: Record<PrioridadReporte, string> = {
  [PrioridadReporte.ALTA]: 'badge--prioridad-alta',
  [PrioridadReporte.MEDIA]: 'badge--prioridad-media',
  [PrioridadReporte.BAJA]: 'badge--prioridad-baja',
}

export const PrioridadBadge: React.FC<PrioridadBadgeProps> = ({ prioridad }) => {
  return (
    <span className={`badge ${CLASE_POR_PRIORIDAD[prioridad]}`} aria-label={`Prioridad ${prioridad}`}>
      {prioridad}
    </span>
  )
}
