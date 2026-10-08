import { RolUsuario } from './enums/RolUsuario'
import { EstadoCuentaUsuario } from './enums/EstadoCuentaUsuario'

/**
 * Entidad de dominio Usuario — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: Usuario)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A1, A10)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T009)
 *
 * Encapsula un usuario de la red social con validaciones de negocio para:
 * - Perfil propio (HU-01, HU-02)
 * - Perfil ajeno (HU-03, A10)
 * - Validaciones de campos (username, sobreMi, descripcion)
 * - Disponibilidad de cuenta según estado
 */
export class Usuario {
  constructor(
    public id: string,
    public username: string, // A1: unique globally, 10 chars max, no spaces
    public foto?: string, // A2: URL to uploaded image
    public sobreMi: string = '', // max 80 chars
    public descripcion: string = '', // max 200 chars
    public estado: EstadoCuentaUsuario = EstadoCuentaUsuario.ACTIVO,
    public rol: RolUsuario = RolUsuario.USER,
    public fechaCreacion: Date = new Date(),
    public siguiendoPorUsuarioActual: boolean = false, // A4: follows current user?
    public cantidadSeguidores: number = 0,
  ) {}

  /**
   * Rule 1 (Spec §6, HU-01): Un usuario autenticado puede visualizar su propio perfil.
   * Siempre true para el usuario autenticado dentro de este módulo.
   */
  public puedeVerPerfil(): boolean {
    return true // Own profile always visible to self
  }

  /**
   * Rule 3 (Spec §6, HU-02): Un usuario solo puede editar los datos de su propio perfil.
   * Check is contextual: performed by caller (presentation layer) comparing
   * usuarioAutenticado.id === usuarioAEditar.id
   */
  public puedeEditarPerfil(usuarioActual: Usuario): boolean {
    return this.id === usuarioActual.id
  }

  /**
   * Rule 11 (Spec §6): El nombre de usuario debe permitir números, mayúsculas,
   * minúsculas, guiones bajos y puntos; no debe superar los 10 caracteres y no
   * debe permitir espacios.
   * Returns true if username is valid (client-side check).
   * Backend is authoritative for uniqueness (A1).
   */
  public esNombreUsuarioValido(): boolean {
    if (this.username.length === 0 || this.username.length > 10) {
      return false
    }
    // Allow: a-z, A-Z, 0-9, _, .
    return /^[a-zA-Z0-9_.]+$/.test(this.username)
  }

  /**
   * Rule 12 (Spec §6): El "sobre mí" no debe superar los 80 caracteres.
   */
  public esSobreMiValido(): boolean {
    return this.sobreMi.length <= 80
  }

  /**
   * Rule 13 (Spec §6): La descripción no debe superar los 200 caracteres.
   */
  public esDescripcionValida(): boolean {
    return this.descripcion.length <= 200
  }

  /**
   * Visibility rule (A10): Cuenta está disponible si está ACTIVA.
   * Only ACTIVO accounts can have visible profiles to third parties.
   * BANEADO and ELIMINADO accounts return 404/403 (A10).
   */
  public estaDisponible(): boolean {
    return this.estado === EstadoCuentaUsuario.ACTIVO
  }

  /**
   * Helper: Check if this is the current user's profile.
   */
  public esUsuarioActual(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    return this.id === usuarioActualId
  }

  /**
   * Helper: Determine if follow button should be shown (not on own profile).
   */
  public debeeMostrarBotonSeguir(usuarioActualId: string): boolean {
    return !this.esUsuarioActual(usuarioActualId)
  }

  /**
   * Validate all profile fields together.
   * Used when submitting edited profile data.
   */
  public esPerfilValido(): boolean {
    return (
      this.esNombreUsuarioValido() &&
      this.esSobreMiValido() &&
      this.esDescripcionValida()
    )
  }
}
