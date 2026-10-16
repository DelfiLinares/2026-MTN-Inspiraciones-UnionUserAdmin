import { EstadoPublicacionAdmin as EstadoPublicacion } from './enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from './enums/MotivoReporteAdmin'

export interface PublicacionModeracionProps {
  id: string
  autorId: string
  estado: EstadoPublicacion
  cantidadReportes: number
  motivosReporte: MotivoReporte[]
}

/**
 * Entidad de dominio PublicacionModeracion (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T022, T032)
 *
 * Trazabilidad adicional (T018, `Union/specs/002-frontend-admin/tasks.md`):
 * Esta clase hace pasar los tests de T015 (`tests/domain/PublicacionModeracion.test.ts`):
 * `puedeSerEditada()`, `puedeSerEliminada()` (ya existente, vía `puedeEliminarse()`), `estaActiva()`
 * y `estaReportada()` (ya existente), implementando RF-09, RF-10, RF-12 de
 * `Union/specs/002-frontend-admin/spec.md`. Ver el comentario de cabecera de
 * `PublicacionModeracion.test.ts` para la justificación de por qué esta entidad administrativa vive
 * bajo `PublicacionModeracion.ts` en lugar de `Publicacion.ts` (colisión de nombres con la entidad
 * social de `001-plataforma-unificada`).
 */
export class PublicacionModeracion {
  readonly id: string
  readonly autorId: string
  estado: EstadoPublicacion
  readonly cantidadReportes: number
  readonly motivosReporte: MotivoReporte[]

  constructor(props: PublicacionModeracionProps) {
    this.id = props.id
    this.autorId = props.autorId
    this.estado = props.estado
    this.cantidadReportes = props.cantidadReportes
    this.motivosReporte = props.motivosReporte
  }

  estaReportada(): boolean {
    return this.estado === EstadoPublicacion.REPORTADA
  }

  /**
   * RF-11 / data-model.md: indica si la publicación está en estado `ACTIVA`.
   */
  estaActiva(): boolean {
    return this.estado === EstadoPublicacion.ACTIVA
  }

  puedeEliminarse(): boolean {
    return this.estado !== EstadoPublicacion.ELIMINADA
  }

  /**
   * RF-09: el sistema DEBE permitir editar el contenido de una publicación de cualquier usuario,
   * sin distinción de autor ni de estado previo, salvo que ya esté `ELIMINADA` (una publicación
   * eliminada deja de ser editable).
   */
  puedeSerEditada(): boolean {
    return this.estado !== EstadoPublicacion.ELIMINADA
  }

  // Alias para interoperabilidad de nomenclatura con la base de admin
  puedeSerEliminada(): boolean {
    return this.puedeEliminarse()
  }

  /**
   * T050d (`Union/specs/002-frontend-admin/tasks.md`, depende de T018): si `estado === REPORTADA`
   * y no existen otros reportes `PENDIENTE`/`EN_REVISION` asociados, reactiva la publicación
   * (`estado` pasa a `ACTIVA`). Si `hayOtrosReportesPendientesOEnRevision` es `true`, no modifica
   * el estado. Invocado por `ReportesService.rechazar()` (resuelto, Clarifications Session
   * 2026-10-01, AC-08.6). Ref: `data-model.md` → Publicacion.reactivarSiNoQuedanReportesPendientes.
   */
  reactivarSiNoQuedanReportesPendientes(hayOtrosReportesPendientesOEnRevision: boolean): void {
    if (this.estado === EstadoPublicacion.REPORTADA && !hayOtrosReportesPendientesOEnRevision) {
      this.estado = EstadoPublicacion.ACTIVA
    }
  }
}
