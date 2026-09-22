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
 */
export class PublicacionModeracion {
  readonly id: string
  readonly autorId: string
  readonly estado: EstadoPublicacion
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

  puedeEliminarse(): boolean {
    return this.estado !== EstadoPublicacion.ELIMINADA
  }

  // Alias para interoperabilidad de nomenclatura con la base de admin
  puedeSerEliminada(): boolean {
    return this.puedeEliminarse()
  }
}
