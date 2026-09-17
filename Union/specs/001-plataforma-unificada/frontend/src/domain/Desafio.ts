export interface DesafioProps {
  id: string
  titulo: string
  descripcion: string
  activo: boolean
  completadoPorUsuarioActual: boolean
}

/**
 * Entidad de dominio Desafio (UI Domain - frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T020, T030)
 */
export class Desafio {
  readonly id: string
  readonly titulo: string
  readonly descripcion: string
  readonly activo: boolean
  readonly completadoPorUsuarioActual: boolean

  constructor(props: DesafioProps) {
    this.id = props.id
    this.titulo = props.titulo
    this.descripcion = props.descripcion
    this.activo = props.activo
    this.completadoPorUsuarioActual = props.completadoPorUsuarioActual
  }

  /**
   * Determina si el usuario actual puede participar en el desafío.
   * Requiere autenticado = true.
   */
  puedeParticiparUsuarioActual(autenticado: boolean): boolean {
    return Boolean(autenticado)
  }
}
