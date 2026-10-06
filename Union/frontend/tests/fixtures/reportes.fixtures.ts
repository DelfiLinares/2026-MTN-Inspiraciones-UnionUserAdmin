/**
 * Fixtures de reportes para validación manual/tests del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Prerrequisitos
 * - Union/specs/002-frontend-admin/research.md §2 (uso exclusivo en `tests/` y demo visual)
 *
 * Cobertura mínima exigida por quickstart (Prerrequisitos):
 * - Un reporte en `PENDIENTE`.
 * - Un reporte en `EN_REVISION`.
 * - Un reporte en estado final (`RESUELTO` o `DESESTIMADO`).
 */

import type { ReporteProps } from '../../src/domain/Reporte'
import { MotivoReporteAdmin } from '../../src/domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'

/**
 * Reporte pendiente (mínimo requerido):
 * - Escenarios 6 y 7: visualización, filtros y aceptación.
 */
export const REPORTE_PENDIENTE_FIXTURE: ReporteProps = {
  id: 'rep-pendiente-001',
  publicacionId: 'pub-reportada-001',
  motivo: MotivoReporteAdmin.SPAM,
  reportanteId: 'user-reportante-001',
  fecha: '2026-10-01T09:00:00.000Z',
  estado: EstadoModeracion.PENDIENTE,
  prioridad: PrioridadReporte.ALTA,
}

/**
 * Reporte en revisión (mínimo requerido):
 * - Escenarios 6, 7 y 8: filtros y operaciones sobre estados no finales.
 */
export const REPORTE_EN_REVISION_FIXTURE: ReporteProps = {
  id: 'rep-en-revision-001',
  publicacionId: 'pub-reportada-001',
  motivo: MotivoReporteAdmin.CONTENIDO_INAPROPIADO,
  reportanteId: 'user-reportante-002',
  fecha: '2026-10-01T10:30:00.000Z',
  estado: EstadoModeracion.EN_REVISION,
  prioridad: PrioridadReporte.MEDIA,
}

/**
 * Reporte en estado final (mínimo requerido):
 * - Escenarios 7 y 8: verificación de acciones Aceptar/Rechazar deshabilitadas (CB-03).
 */
export const REPORTE_FINAL_RESUELTO_FIXTURE: ReporteProps = {
  id: 'rep-final-001',
  publicacionId: 'pub-reportada-001',
  motivo: MotivoReporteAdmin.OTRO,
  reportanteId: 'user-reportante-003',
  fecha: '2026-09-29T14:00:00.000Z',
  estado: EstadoModeracion.RESUELTO,
  prioridad: PrioridadReporte.BAJA,
}

/**
 * Colección sugerida para listados de reportes.
 */
export const REPORTES_FIXTURES: ReporteProps[] = [
  REPORTE_PENDIENTE_FIXTURE,
  REPORTE_EN_REVISION_FIXTURE,
  REPORTE_FINAL_RESUELTO_FIXTURE,
]
