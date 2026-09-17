import { RolUsuario } from './enums/RolUsuario'

export interface UsuarioProps {
  id: string
  nombre: string
  apellido: string
  bio?: string
  fotoUrl?: string
  rol: RolUsuario
  siguiendoAlUsuarioActual: boolean
  cantidadSeguidores: number
}

/**
 * Entidad de dominio Usuario (UI Domain - frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T017, T027)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-37, RF-39)
 */
export class Usuario {
  readonly id: string
  readonly nombre: string
  readonly apellido: string
  readonly bio?: string
  readonly fotoUrl?: string
  readonly rol: RolUsuario
  readonly siguiendoAlUsuarioActual: boolean
  readonly cantidadSeguidores: number

  constructor(props: UsuarioProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.apellido = props.apellido
    this.bio = props.bio
    this.fotoUrl = props.fotoUrl
    this.rol = props.rol
    this.siguiendoAlUsuarioActual = props.siguiendoAlUsuarioActual
    this.cantidadSeguidores = props.cantidadSeguidores
  }

  esUsuarioActual(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    return this.id === usuarioActualId
  }

  puedeMostrarBotonSeguir(usuarioActualId: string): boolean {
    return !this.esUsuarioActual(usuarioActualId)
  }

  toggleSeguir(): Usuario {
    const nuevoEstadoSiguiendo = !this.siguiendoAlUsuarioActual
    const nuevaCantidad = nuevoEstadoSiguiendo
      ? this.cantidadSeguidores + 1
      : Math.max(0, this.cantidadSeguidores - 1)

    return new Usuario({
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      bio: this.bio,
      fotoUrl: this.fotoUrl,
      rol: this.rol,
      siguiendoAlUsuarioActual: nuevoEstadoSiguiendo,
      cantidadSeguidores: nuevaCantidad,
    })
  }
}
