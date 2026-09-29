import { TipoContenido } from './enums/TipoContenido'
import { EstadoPublicacion } from './enums/EstadoPublicacion'

export interface PublicacionProps {
  id: string
  autorId: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
  tags: string[]
  cantidadLikes: number
  likeDelUsuarioActual: boolean
  reportadaPorUsuarioActual: boolean
}

/**
 * Entidad de dominio Publicacion (UI Domain).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T016, T026)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-30 a RF-35)
 */
export class Publicacion {
  readonly id: string
  readonly autorId: string
  readonly tipoContenido: TipoContenido
  readonly estado: EstadoPublicacion
  readonly tags: string[]
  readonly cantidadLikes: number
  readonly likeDelUsuarioActual: boolean
  readonly reportadaPorUsuarioActual: boolean

  constructor(props: PublicacionProps) {
    this.id = props.id
    this.autorId = props.autorId
    this.tipoContenido = props.tipoContenido
    this.estado = props.estado
    this.tags = props.tags
    this.cantidadLikes = props.cantidadLikes
    this.likeDelUsuarioActual = props.likeDelUsuarioActual
    this.reportadaPorUsuarioActual = props.reportadaPorUsuarioActual
  }

  esPropia(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    return this.autorId === usuarioActualId
  }

  puedeDarLike(usuarioActualId: string, autenticado: boolean): boolean {
    if (!autenticado || !usuarioActualId) {
      return false
    }
    if (this.esPropia(usuarioActualId)) {
      return false
    }
    return this.estado === EstadoPublicacion.ACTIVA
  }

  puedeReportar(usuarioActualId: string, autenticado: boolean): boolean {
    if (!autenticado || !usuarioActualId) {
      return false
    }
    if (this.esPropia(usuarioActualId)) {
      return false
    }
    return !this.reportadaPorUsuarioActual
  }

  puedeEditar(usuarioActualId: string): boolean {
    return this.esPropia(usuarioActualId)
  }

  puedeEliminar(usuarioActualId: string): boolean {
    return this.esPropia(usuarioActualId)
  }

  toggleLike(): Publicacion {
    const nuevoEstadoLike = !this.likeDelUsuarioActual
    const nuevaCantidad = nuevoEstadoLike
      ? this.cantidadLikes + 1
      : Math.max(0, this.cantidadLikes - 1)

    return new Publicacion({
      id: this.id,
      autorId: this.autorId,
      tipoContenido: this.tipoContenido,
      estado: this.estado,
      tags: this.tags,
      cantidadLikes: nuevaCantidad,
      likeDelUsuarioActual: nuevoEstadoLike,
      reportadaPorUsuarioActual: this.reportadaPorUsuarioActual,
    })
  }
}
