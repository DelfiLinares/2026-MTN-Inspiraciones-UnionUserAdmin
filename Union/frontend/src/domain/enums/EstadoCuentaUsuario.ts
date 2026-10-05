/**
 * Enum `EstadoCuentaUsuario`.
 *
 * Fuente de verdad:
 * - Union/specs/002-frontend-admin/data-model.md → Enums
 * - Union/specs/002-frontend-admin/tasks.md (T009)
 * - Union/specs/002-frontend-admin/spec.md RF-04
 */
export enum EstadoCuentaUsuario {
  ACTIVO = "ACTIVO",
  BANEADO = "BANEADO",
  ELIMINADO = "ELIMINADO",
}
