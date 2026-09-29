import { EstadoDesafioPropuesto } from './enums/EstadoDesafioPropuesto'

export interface DesafioPropuestoProps {
  id: string
  autorId: string
  contenidoFormulario?: Record<string, unknown>
  estado: EstadoDesafioPropuesto
  titulo?: string
  descripcion?: string
  fechaPropuesta?: Date
}

/**
 * Entidad de dominio DesafioPropuesto (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T024, T034)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-68, RF-69, CB-15)
 */
export class DesafioPropuesto {
  readonly id: string
  readonly autorId: string
  readonly contenidoFormulario: Record<string, unknown>
  readonly estado: EstadoDesafioPropuesto
  readonly titulo?: string
  readonly descripcion?: string
  readonly fechaPropuesta?: Date

  constructor(props: DesafioPropuestoProps) {
    this.id = props.id
    this.autorId = props.autorId
    this.contenidoFormulario = props.contenidoFormulario ?? {
      titulo: props.titulo,
      descripcion: props.descripcion,
    }
    this.estado = props.estado
    this.titulo = props.titulo
    this.descripcion = props.descripcion
    this.fechaPropuesta = props.fechaPropuesta
  }

  estaPendiente(): boolean {
    return this.estado === EstadoDesafioPropuesto.PENDIENTE
  }

  /**
   * Ref: RF-68, CB-15.
   * La transición es irreversible: solo puede aprobarse mientras esté PENDIENTE.
   */
  puedeAprobarse(): boolean {
    return this.estaPendiente()
  }

  /**
   * Ref: RF-69, CB-15.
   * La transición es irreversible: solo puede rechazarse mientras esté PENDIENTE.
   */
  puedeRechazarse(): boolean {
    return this.estaPendiente()
  }
}
