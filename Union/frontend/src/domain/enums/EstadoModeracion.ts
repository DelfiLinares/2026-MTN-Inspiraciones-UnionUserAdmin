/**
 * Enum `EstadoModeracion`.
 *
 * Fuente de verdad:
 * - Union/specs/002-frontend-admin/data-model.md → Enums
 * - Union/specs/002-frontend-admin/tasks.md (T011)
 * - Union/specs/002-frontend-admin/spec.md RF-18
 */
export enum EstadoModeracion {
  PENDIENTE = "PENDIENTE",
  EN_REVISION = "EN_REVISION",
  RESUELTO = "RESUELTO",
  DESESTIMADO = "DESESTIMADO",
}
