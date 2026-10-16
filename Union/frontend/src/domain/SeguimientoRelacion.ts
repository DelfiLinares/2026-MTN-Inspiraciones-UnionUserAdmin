/**
 * Value Object SeguimientoRelacion — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Value Objects: SeguimientoRelacion)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, A4)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T012)
 *
 * Value object inmutable que encapsula la relación de seguimiento entre dos usuarios.
 * Implementa patrón toggle bidireccional: seguir/dejar de seguir (A4).
 * - AC-04.3: Tras seguir con éxito, la interfaz refleja el nuevo estado.
 * - AC-04.4: Si falla, se muestra error y el estado no cambia.
 * - AC-04.5: No requiere confirmación explícita (no es destructiva).
 */
export class SeguimientoRelacion {
  constructor(
    public usuarioId: string, // Usuario que sigue
    public usuarioASeguidoId: string, // Usuario siendo seguido
    public siguiendo: boolean = false, // Estado: siguiendo o no
  ) {}

  /**
   * Toggle follow state (A4).
   * Retorna nueva instancia (value object immutable, patrón funcional).
   * Usado por servicios para optimistic update: toggle local, revert si error.
   */
  public toggle(): SeguimientoRelacion {
    return new SeguimientoRelacion(
      this.usuarioId,
      this.usuarioASeguidoId,
      !this.siguiendo,
    )
  }

  /**
   * Indica si usuario está siguiendo al target.
   * Alias para `this.siguiendo`.
   */
  public esSiguiendo(): boolean {
    return this.siguiendo
  }

  /**
   * Indica si usuario NO está siguiendo al target.
   * Alias negado.
   */
  public noEsSiguiendo(): boolean {
    return !this.siguiendo
  }

  /**
   * Helper: Get display text for button state.
   */
  public getBotonTexto(): string {
    return this.siguiendo ? 'Dejar de seguir' : 'Seguir'
  }
}
