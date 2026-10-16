/**
 * DTO ActualizarPerfilPayload — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (schema: ActualizarPerfilRequest)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, AC-02.1–AC-02.8, A1)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T015)
 *
 * Tipado para actualización de datos de perfil propio (sin foto).
 * Foto se envía en endpoint separado con multipart/form-data (T016).
 * Todos los campos son opcionales (minProperties: 1 en openapi.yaml).
 *
 * Cambio de username requiere confirmación explícita (AC-02.6).
 * Backend valida uniqueness de username (A1).
 */
export interface ActualizarPerfilPayload {
  /**
   * Nuevo nombre de usuario.
   * - 1–10 caracteres (AC-02.3)
   * - Patrón: [A-Za-z0-9_.] (AC-02.2)
   * - Sin espacios permitidos (AC-02.2)
   * - Debe ser único en plataforma (A1, backend authoritative)
   * - Requiere confirmación explícita antes de envío (AC-02.6)
   */
  nombreUsuario?: string

  /**
   * Biografía corta.
   * - Max 80 caracteres (AC-02.4)
   * - Espacios permitidos (AC-02.4)
   */
  sobreMi?: string

  /**
   * Descripción más larga.
   * - Max 200 caracteres (AC-02.5)
   * - Espacios permitidos (AC-02.5)
   */
  descripcion?: string
}

/**
 * Helper: Validar que hay al menos un campo para actualizar.
 * Requiere minProperties: 1 según openapi.yaml.
 */
export const tieneAlgunCampoActualizar = (
  payload: ActualizarPerfilPayload,
): boolean => {
  return !!(
    payload.nombreUsuario ||
    payload.sobreMi ||
    payload.descripcion
  )
}

/**
 * Helper: Crear payload vacío.
 */
export const crearPayloadVacio = (): ActualizarPerfilPayload => ({})
