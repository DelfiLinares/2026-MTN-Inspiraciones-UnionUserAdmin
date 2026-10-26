/**
 * Control de peticiones de la sesión de búsqueda (T034b).
 *
 * Combina un token de secuencia con un `AbortController` (plan.md §4):
 * - cada petición nueva cancela la anterior (`AbortController.abort()`) e invalida su token;
 * - la respuesta (o error) de una petición solo se aplica si su token sigue vigente, de modo
 *   que lo que llegue tarde se ignora aunque el repositorio no respete la cancelación (RF-10).
 *
 * Una sola petición puede estar vigente a la vez: cambiar criterios cancela también una
 * carga adicional en curso.
 */
export interface PeticionVigente {
  readonly token: number
  readonly signal: AbortSignal
}

export class ControlPeticiones {
  private secuencia = 0
  private controlador: AbortController | null = null

  /** Cancela la petición anterior (si la hay) y devuelve el token y la señal de la nueva. */
  nueva(): PeticionVigente {
    this.cancelar()
    const controlador = new AbortController()
    this.controlador = controlador
    return { token: this.secuencia, signal: controlador.signal }
  }

  /** `true` si el token corresponde a la última petición iniciada y no fue cancelada. */
  esVigente(token: number): boolean {
    return token === this.secuencia
  }

  /** Aborta la petición en curso e invalida su token. */
  cancelar(): void {
    this.secuencia++
    this.controlador?.abort()
    this.controlador = null
  }
}
