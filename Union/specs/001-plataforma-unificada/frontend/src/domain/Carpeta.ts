export interface CarpetaProps {
  id: string
  nombre: string
  cantidadPosts: number
  deLaCarpetaDelUsuarioActual?: boolean
  propietarioId?: string
}

/**
 * Entidad de dominio Carpeta (UI Domain - frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T019, T029)
 * - Union/specs/001-plataforma-unificada/spec.md (HU-09, RF-50 a RF-53)
 */
export class Carpeta {
  readonly id: string
  readonly nombre: string
  readonly cantidadPosts: number
  readonly deLaCarpetaDelUsuarioActual: boolean
  readonly propietarioId?: string

  constructor(props: CarpetaProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.cantidadPosts = props.cantidadPosts
    this.propietarioId = props.propietarioId
    this.deLaCarpetaDelUsuarioActual =
      props.deLaCarpetaDelUsuarioActual ??
      (props.propietarioId !== undefined && props.propietarioId !== '')
  }

  /**
   * Solo el dueño puede eliminar la carpeta.
   * Soporta firma de data-model.md `puedeEliminarse(usuarioActualId, propietarioId)`
   * y sobrecarga flexible con fallback al propietario interno.
   */
  puedeEliminarse(usuarioActualId: string, propietarioId?: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    const idDuenio = propietarioId ?? this.propietarioId
    if (idDuenio !== undefined) {
      return idDuenio === usuarioActualId
    }
    return this.deLaCarpetaDelUsuarioActual
  }

  /**
   * Solo el dueño puede renombrar la carpeta.
   * Soporta firma de data-model.md `puedeRenombrarse(usuarioActualId, propietarioId)`
   * y sobrecarga flexible con fallback al propietario interno.
   */
  puedeRenombrarse(usuarioActualId: string, propietarioId?: string): boolean {
    return this.puedeEliminarse(usuarioActualId, propietarioId)
  }

  // Alias para interoperabilidad de nomenclatura
  puedeEliminar(usuarioActualId: string, propietarioId?: string): boolean {
    return this.puedeEliminarse(usuarioActualId, propietarioId)
  }

  puedeRenombrar(usuarioActualId: string, propietarioId?: string): boolean {
    return this.puedeRenombrarse(usuarioActualId, propietarioId)
  }
}
