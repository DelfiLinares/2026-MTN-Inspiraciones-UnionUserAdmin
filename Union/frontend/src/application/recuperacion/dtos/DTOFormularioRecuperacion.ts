/**
 * DTOFormularioRecuperacion
 *
 * Data Transfer Object para el formulario de recuperación de contraseña.
 * Representa el estado del formulario serializable y transferible entre capas.
 *
 * Propiedades:
 * - correo: String con el email del usuario
 * - tocado: Boolean indicando si el usuario ha interactuado con el campo
 * - errores: Record<string, string> con errores validación por campo
 */
export type DTOFormularioRecuperacion = {
  correo: string;
  tocado: boolean;
  errores: Record<string, string>;
};
