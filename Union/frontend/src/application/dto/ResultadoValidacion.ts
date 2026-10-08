/**
 * DTO ResultadoValidacion — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/data-model.md (DTOs: ResultadoValidacion)
 * - Union/specs/004-inspiraciones-perfil/spec.md (A1, A2, A3)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T013)
 *
 * Tipado reusable para encapsular resultados de validaciones de formulario.
 * Utilizado en componentes de presentación para mostrar errores de validación.
 * Aplicable a validaciones de:
 * - Username (A1): uniqueness, format, length
 * - Foto (A2): format, size
 * - Nombre de carpeta (A3): uniqueness per user, length
 * - Otros campos (sobreMi, descripcion, etc.)
 */
export interface ResultadoValidacion {
  /**
   * Indica si la validación fue exitosa.
   */
  esValido: boolean

  /**
   * Mensaje de error si la validación falló.
   * Opcional; si no hay error, es undefined.
   */
  error?: string

  /**
   * Campo que falló la validación (username, sobreMi, nombre, etc.).
   * Opcional; útil para multi-field forms.
   */
  campo?: string
}

/**
 * Helper factory para crear resultado exitoso.
 */
export const validacionOk = (): ResultadoValidacion => ({
  esValido: true,
})

/**
 * Helper factory para crear resultado con error.
 */
export const validacionError = (
  error: string,
  campo?: string,
): ResultadoValidacion => ({
  esValido: false,
  error,
  campo,
})
