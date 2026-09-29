import { MotivoReporteAdmin as MotivoReporte } from './enums/MotivoReporteAdmin'
import { EstadoModeracion } from './enums/EstadoModeracion'
import { PrioridadReporte } from './enums/PrioridadReporte'

export interface ReporteProps {
  id: string
  publicacionId: string
  motivo: MotivoReporte
  reportanteId: string
  fecha: string | Date
  estado: EstadoModeracion
  prioridad?: PrioridadReporte
}

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000

/**
 * Entidad de dominio Reporte (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T023, T031B, T033)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-64, RF-65)
 */
export class Reporte {
  readonly id: string
  readonly publicacionId: string
  readonly motivo: MotivoReporte
  readonly reportanteId: string
  readonly fecha: string
  readonly estado: EstadoModeracion
  readonly prioridad?: PrioridadReporte

  constructor(props: ReporteProps) {
    this.id = props.id
    this.publicacionId = props.publicacionId
    this.motivo = props.motivo
    this.reportanteId = props.reportanteId
    this.fecha =
      props.fecha instanceof Date ? props.fecha.toISOString() : props.fecha
    this.estado = props.estado
    this.prioridad = props.prioridad
  }

  // Alias para interoperabilidad de pruebas previas
  get fechaCreacion(): Date {
    return new Date(this.fecha)
  }

  estaPendiente(): boolean {
    return (
      this.estado === EstadoModeracion.PENDIENTE ||
      this.estado === EstadoModeracion.EN_REVISION
    )
  }

  puedeResolverseSinEliminar(): boolean {
    return this.estaPendiente()
  }

  puedeResolverseConEliminacion(): boolean {
    return this.estaPendiente()
  }

  antiguedadEnDias(fechaActual: Date): number {
    const fechaCreacionMs = new Date(this.fecha).getTime()
    const diffMs = fechaActual.getTime() - fechaCreacionMs
    return Math.max(0, Math.floor(diffMs / MILISEGUNDOS_POR_DIA))
  }
}
