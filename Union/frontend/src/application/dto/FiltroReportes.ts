import { EstadoModeracion } from '../../domain/enums/EstadoModeracion'
import { MotivoReporte } from '../../domain/enums/MotivoReporteAdmin'
import { PrioridadReporte } from '../../domain/enums/PrioridadReporte'

/**
 * DTO de aplicación `FiltroReportes`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T020, depende de T011, T012, T013)
 * - Union/specs/002-frontend-admin/data-model.md §Objetos de Aplicación
 * - Union/specs/002-frontend-admin/spec.md RF-14
 * - Clarifications Session 2026-10-01: ubicación confirmada en `src/application/dto/`.
 *
 * Value object (inmutable, sin comportamiento) que encapsula los criterios de filtrado
 * del listado de reportes. Todos sus atributos son opcionales: la ausencia de un criterio
 * indica que no se filtra por ese campo.
 */
export interface FiltroReportes {
  readonly estadoModeracion?: EstadoModeracion
  readonly prioridad?: PrioridadReporte
  readonly motivo?: MotivoReporte
}
