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
 *
 * Trazabilidad adicional (T017, `Union/specs/002-frontend-admin/tasks.md`):
 * Esta clase hace pasar los tests de T014 (`tests/domain/UsuarioAdmin.test.ts`): `puedeSerBaneado()`,
 * `puedeSerEliminado()` y `puedeSerPromovidoAAdmin()`, implementando RF-01, RF-02, RF-03, RF-06,
 * RF-08 de `Union/specs/002-frontend-admin/spec.md` y las reglas de negocio críticas 7 y 8 de §6
 * (no banear/eliminar/degradar a un ADMIN ni a uno mismo; no-op al promover a quien ya es ADMIN).
 * Ver el comentario de cabecera de `UsuarioAdmin.test.ts` para la justificación de por qué esta
 * entidad administrativa vive bajo `UsuarioAdmin.ts` en lugar de `Usuario.ts` (colisión de nombres
 * con la entidad social de `001-plataforma-unificada`).
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
