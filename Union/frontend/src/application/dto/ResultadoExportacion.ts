/**
 * DTO de aplicación `ResultadoExportacion`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T021)
 * - Union/specs/002-frontend-admin/data-model.md §Objetos de Aplicación
 * - Union/specs/002-frontend-admin/spec.md RF-19, RF-20
 * - Clarifications Session 2026-10-01: ubicación confirmada en `src/application/dto/`.
 *
 * Value object (inmutable, sin comportamiento) que representa el resultado de una
 * operación de exportación de reportes. `urlDescarga` solo está presente cuando
 * `exitoso === true`; `mensajeError` solo está presente cuando `exitoso === false`.
 * La URL de descarga se trata como opaca (ver `research.md` §5).
 */
export interface ResultadoExportacion {
  readonly exitoso: boolean
  readonly urlDescarga?: string
  readonly nombreArchivoSugerido?: string
  readonly mensajeError?: string
}
