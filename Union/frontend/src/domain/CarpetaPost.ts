/**
 * Entidad de dominio CarpetaPost — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: CarpetaPost)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, A3, A7)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T010)
 *
 * Encapsula una carpeta de posts guardados de un usuario con validaciones de negocio para:
 * - Crear carpeta (HU-05)
 * - Renombrar carpeta (HU-06)
 * - Eliminar carpeta (HU-07)
 * - Listar carpetas (HU-08)
 */
export class CarpetaPost {
  constructor(
    public id: string,
    public usuarioId: string,
    public nombre: string, // max 15 chars, spaces allowed
    public descripcion: string = '', // optional
    public fechaCreacion: Date = new Date(),
    public postCount: number = 0, // derived from backend
  ) {}

  /**
   * Rule 4 (Spec §6, HU-05, HU-06): El sistema DEBE permitir crear, renombrar
   * carpetas... que no supere los 15 caracteres.
   * Returns true if folder name is valid (client-side check).
   * Backend validates uniqueness per user (A3).
   */
  public esNombreValido(): boolean {
    if (this.nombre.length === 0 || this.nombre.length > 15) {
      return false
    }
    // Spaces are allowed (unlike username)
    return true
  }

  /**
   * Rule 8 (Spec §6): La lista de carpetas del usuario DEBE soportar hasta
   * un máximo de 50 carpetas sin degradar la interfaz.
   * This check is performed at service level with server-side validation.
   */
  public esCarpetaValida(): boolean {
    return this.esNombreValido()
  }

  /**
   * Helper to check if folder can be deleted.
   * A7: Can delete with or without posts inside. Posts are not deleted.
   */
  public puedeSerEliminada(): boolean {
    return true // Always deletable (A7)
  }

  /**
   * Helper to check if folder can be renamed.
   * A3: Backend validates uniqueness per user.
   */
  public puedeSerRenombrada(): boolean {
    return true // Renaming allowed anytime; backend validates uniqueness (A3)
  }

  /**
   * Get display string for folder with post count.
   */
  public getDisplayName(): string {
    return `${this.nombre} (${this.postCount})`
  }
}
