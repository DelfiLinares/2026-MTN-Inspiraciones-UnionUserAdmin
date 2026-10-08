/**
 * Entidad de dominio Publicacion — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Domain Entities: Publicacion)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-11, HU-12, HU-13, A5)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T011)
 *
 * Encapsula una publicación propia dentro del módulo de perfil con reglas de negocio para:
 * - Editar publicación (HU-11): Solo texto es editable, imagen es inmutable (A5)
 * - Eliminar publicación (HU-12)
 * - Visualizar posts del perfil (HU-13)
 */
export class Publicacion {
  constructor(
    public id: string,
    public autorId: string,
    public imagenUrl: string, // URL de imagen (A5: immutable)
    public texto: string, // A5: mutable (max 2000 chars per openapi.yaml)
    public fechaCreacion: Date = new Date(),
    public fechaActualizacion?: Date,
  ) {}

  /**
   * Rule (A5): Solo el texto es editable; la imagen es inmutable.
   * Returns true if post can be edited (authorization checked by caller/backend).
   */
  public puedeSerEditada(): boolean {
    return true // Editable anytime; backend validates authorization
  }

  /**
   * Rule (A5): La imagen no puede cambiar después de publicación.
   * This is enforced by domain and application layer:
   * only `texto` field is sent to backend on edit (openapi.yaml: PATCH /publicaciones/{publicacionId})
   */
  public esImagenImmutable(): boolean {
    return true // Image never changes
  }

  /**
   * Helper: Post can be deleted anytime by owner.
   * Backend validates authorization (es autorId).
   */
  public puedeSerEliminada(): boolean {
    return true // Deletable anytime; backend validates authorization
  }

  /**
   * Helper: Check if this is the current user's post.
   */
  public esPropia(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    return this.autorId === usuarioActualId
  }

  /**
   * Validate text field (max 2000 chars per openapi.yaml).
   */
  public esTextoValido(): boolean {
    return this.texto.length > 0 && this.texto.length <= 2000
  }
}
