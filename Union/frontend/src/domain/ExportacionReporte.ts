export interface ExportacionReporteProps {
  disponible: boolean
  urlDescarga?: string
  errorMensaje?: string
  // Propiedades opcionales de interoperabilidad con Admin
  reporteAnaliticaId?: string
  exitoso?: boolean
  mensajeError?: string
}

/**
 * Entidad de dominio ExportacionReporte (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T025, T035)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-71 a RF-74)
 */
export class ExportacionReporte {
  readonly disponible: boolean
  readonly urlDescarga?: string
  readonly errorMensaje?: string
  readonly reporteAnaliticaId?: string

  constructor(props: ExportacionReporteProps) {
    this.disponible = props.disponible
    this.urlDescarga = props.urlDescarga
    this.errorMensaje = props.errorMensaje ?? props.mensajeError
    this.reporteAnaliticaId = props.reporteAnaliticaId
  }

  /**
   * Ref: data-model.md y tasks.md T025/T035.
   * `fueExitosa(): boolean` → `disponible === true && !errorMensaje`.
   * Si hay errorMensaje es false aunque disponible sea true.
   */
  fueExitosa(): boolean {
    return this.disponible === true && !this.errorMensaje
  }

  // Métodos auxiliares de compatibilidad
  estaListoParaDescargar(): boolean {
    return this.fueExitosa() && Boolean(this.urlDescarga)
  }

  fallo(): boolean {
    return !this.fueExitosa()
  }

  get mensajeError(): string | undefined {
    return this.errorMensaje
  }

  get exitoso(): boolean {
    return this.fueExitosa()
  }
}
