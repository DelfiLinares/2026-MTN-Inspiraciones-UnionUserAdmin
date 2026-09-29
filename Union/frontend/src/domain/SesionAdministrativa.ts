import { UsuarioAdmin } from './UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from './enums/RolUsuarioAdmin'

export interface SesionAdministrativaProps {
  usuario: UsuarioAdmin
  token: string
  expiraEn: Date | string
}

/**
 * Entidad de dominio SesionAdministrativa (UI Domain - frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T044)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-75, CB-13)
 */
export class SesionAdministrativa {
  readonly usuario: UsuarioAdmin
  readonly token: string
  readonly expiraEn: Date

  constructor(props: SesionAdministrativaProps) {
    this.usuario = props.usuario
    this.token = props.token
    this.expiraEn = props.expiraEn instanceof Date ? props.expiraEn : new Date(props.expiraEn)
  }

  esValida(fechaActual: Date = new Date()): boolean {
    return this.expiraEn.getTime() > fechaActual.getTime()
  }

  tienePermisoDeAdministrador(): boolean {
    return this.usuario.rol === RolUsuario.ADMIN
  }
}
