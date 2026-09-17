import { RolUsuarioAdmin as RolUsuario } from './enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from './enums/EstadoCuentaUsuario'

export interface UsuarioAdminProps {
  id: string
  nombre: string
  mail?: string
  email?: string
  rol: RolUsuario
  estadoCuenta: EstadoCuentaUsuario
}

/**
 * Entidad de dominio UsuarioAdmin (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T021, T031)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-57 a RF-59, RF-76, CB-11, CB-12)
 */
export class UsuarioAdmin {
  readonly id: string
  readonly nombre: string
  readonly mail: string
  readonly rol: RolUsuario
  readonly estadoCuenta: EstadoCuentaUsuario

  constructor(props: UsuarioAdminProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.mail = props.mail ?? props.email ?? ''
    this.rol = props.rol
    this.estadoCuenta = props.estadoCuenta
  }

  // Alias para interoperabilidad de campos
  get email(): string {
    return this.mail
  }

  esElPropioAdministrador(adminActualId: string): boolean {
    if (!adminActualId) {
      return false
    }
    return this.id === adminActualId
  }

  puedeSerBaneado(adminActualId?: string): boolean {
    if (this.rol === RolUsuario.ADMIN) {
      return false
    }
    if (adminActualId && this.esElPropioAdministrador(adminActualId)) {
      return false
    }
    return this.estadoCuenta === EstadoCuentaUsuario.ACTIVO
  }

  puedeSerEliminado(adminActualId?: string): boolean {
    if (this.rol === RolUsuario.ADMIN) {
      return false
    }
    if (adminActualId && this.esElPropioAdministrador(adminActualId)) {
      return false
    }
    return this.estadoCuenta !== EstadoCuentaUsuario.ELIMINADO
  }

  puedeSerPromovido(): boolean {
    if (this.rol === RolUsuario.ADMIN) {
      return false
    }
    return this.estadoCuenta === EstadoCuentaUsuario.ACTIVO
  }

  // Alias para compatibilidad de nomenclatura
  puedeSerPromovidoAAdmin(): boolean {
    return this.puedeSerPromovido()
  }

  puedeSerDegradado(adminActualId: string): boolean {
    if (this.rol !== RolUsuario.ADMIN) {
      return false
    }
    if (!adminActualId || this.esElPropioAdministrador(adminActualId)) {
      return false
    }
    return true
  }
}
