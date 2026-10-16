/**
 * `perfilErrorMessages`: Centralized error messages for profile operations.
 *
 * Sources of truth:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, AC-02.1–AC-02.8, A1, A2, A10)
 * - Union/specs/004-inspiraciones-perfil/clarifications.md (A1, A2, A10 resolutions)
 * - Union/specs/004-inspiraciones-perfil/research.md (sections 3, 4, 12)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (error handling table)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T066)
 *
 * Responsibilities:
 * 1. Centralize error messages for profile operations (T066):
 *    - A1: Username uniqueness validation (backend enforces via database constraint)
 *    - A2: Photo upload restrictions (format, size, dimensions)
 *    - A10: Banned/deleted profile visibility
 *
 * 2. Support AC-02.7 (clear error messages indicating field and rule):
 *    - Client-side validation errors (AC-02.2–AC-02.5)
 *    - Backend error handling (A1, A2)
 *
 * 3. Support AC-02.8 (preserve form data on server error):
 *    - Messages for 400, 409, 413, 415, 500 status codes
 *
 * 4. Support A10 (banned/deleted profile handling):
 *    - Message for 403/404 when accessing restricted profiles
 *
 * Error categories:
 * - **Validation errors** (AC-02.2–AC-02.5): Client-side format validation
 * - **Uniqueness errors** (A1): Username already exists (409/400 from backend)
 * - **Photo errors** (A2): Format (400/415), size (413), dimensions (400)
 * - **Availability errors** (A10): Profile banned/deleted (403/404)
 * - **Server errors**: 500, network timeout
 *
 * Dependencies:
 * - T032: EditarPerfilForm (uses validation error messages)
 * - T033: PhotoUploadField (uses photo error messages)
 * - T035: PerfilPage (uses availability error messages)
 *
 * Historias de usuario:
 * - HU-02: Editar perfil propio (validaciones AC-02.2–AC-02.8, A1, A2)
 * - HU-03: Visualizar perfil ajeno (A10)
 *
 * Acceptance criteria:
 * - AC-02.7: Mostrar mensaje claro indicando campo y regla incumplida
 * - AC-02.8: Si error servidor, mostrar mensaje y preservar datos
 * - A1: "El nombre de usuario ya existe. Por favor, elige otro."
 * - A2: Format/size/dimension errors from backend
 * - A10: "Este perfil no está disponible. La cuenta ha sido eliminada o está deshabilitada."
 *
 * Clarifications:
 * - A1: Backend is authoritative for uniqueness (database constraint)
 * - A2: Backend validates format, size, dimensions; frontend provides guidance
 * - A10: 403/404 indicates banned or deleted; frontend shows unavailability message
 *
 * Notes:
 * - All messages are user-friendly Spanish strings
 * - Messages reference field names and specific validation rules
 * - Backend errors are captured and re-mapped to user-friendly messages
 * - T066: Reusable across T069 (username confirmation), T053–T055 (post/folder operations)
 */

/**
 * Client-side validation error messages (AC-02.2–AC-02.5).
 * These are shown when form validation fails BEFORE sending to backend.
 *
 * References:
 * - AC-02.2: Username pattern [A-Za-z0-9_.]
 * - AC-02.3: Username max 10 characters
 * - AC-02.4: "Sobre mí" max 80 characters
 * - AC-02.5: Description max 200 characters
 */
export const validationErrorMessages = {
  // Username validation (AC-02.2, AC-02.3, A1)
  nombreUsuarioRequerido: 'El nombre de usuario es requerido',
  nombreUsuarioFormatoInvalido:
    'El nombre de usuario solo puede contener letras, números, guiones bajos (_) y puntos (.)',
  nombreUsuarioTooLong: 'El nombre de usuario no debe superar 10 caracteres',

  // "Sobre mí" validation (AC-02.4)
  sobreMiTooLong: '"Sobre mí" no debe superar 80 caracteres',

  // Description validation (AC-02.5)
  descripcionTooLong: 'La descripción no debe superar 200 caracteres',

  // General validation error (AC-02.7)
  noCambios: 'No hay cambios para guardar',
} as const

/**
 * Backend error messages for A1 (username uniqueness).
 * Returned as 409 Conflict or 400 Bad Request when username already exists.
 *
 * Reference:
 * - A1: Backend enforces uniqueness constraint; frontend displays error
 * - AC-02.6: Confirmation modal is shown BEFORE sending to backend
 * - AC-02.8: If 409/400, preserve form data and show error inline
 */
export const usernameErrorMessages = {
  // A1: Username already exists
  yaExiste: 'El nombre de usuario ya existe. Por favor, elige otro.',

  // Generic username error (fallback if backend returns unexpected format)
  generico: 'No se puede cambiar el nombre de usuario. Por favor, intenta de nuevo.',
} as const

/**
 * Backend error messages for A2 (photo upload restrictions).
 * Returned as 400, 413, or 415 when file validation fails.
 *
 * Reference:
 * - A2: Formats JPG/PNG/WebP, max 5 MB; backend validates format, size, dimensions
 * - AC-02.1: Photo is editable
 * - AC-02.8: If error, preserve form data and show error
 */
export const photoErrorMessages = {
  // 413: File too large
  archivoMuyGrande: 'El archivo debe ser menor a 5 MB',

  // 415 / 400: Invalid format
  formatoNoSoportado:
    'Formato no soportado. Por favor, usa JPG, PNG o WebP.',

  // 400: Dimension validation failed (backend re-encodes or rejects)
  dimensionesInvalidas:
    'Las dimensiones de la imagen no son válidas. Intenta con otra imagen.',

  // Generic photo error (fallback if backend returns unexpected format)
  generico: 'No se puede cambiar la foto de perfil. Por favor, intenta de nuevo.',

  // Guidance text (not an error, but helpful hint for client)
  guidance: 'Formatos: JPG, PNG, WebP. Tamaño máximo: 5 MB.',
} as const

/**
 * Backend error messages for A10 (banned/deleted profile visibility).
 * Returned as 403 Forbidden or 404 Not Found when accessing restricted profiles.
 *
 * Reference:
 * - A10: Banned/deleted profiles (EstadoCuentaUsuario.BANEADO/ELIMINADO) not visible to third parties
 * - Backend returns 403 or 404
 * - Frontend shows ProfileNotFoundView with unavailability message
 */
export const profileAvailabilityErrorMessages = {
  // 403 Forbidden: Profile exists but is banned or deleted
  perfilNoDisponible:
    'Este perfil no está disponible. La cuenta ha sido eliminada o está deshabilitada.',

  // 404 Not Found: Profile does not exist or is hidden
  perfilNoEncontrado: 'No se encontró el perfil. Puede que haya sido eliminado.',

  // Fallback for unexpected status codes
  generico: 'No se puede acceder a este perfil en este momento.',
} as const

/**
 * Generic server error messages (AC-02.8).
 * Returned for unexpected 500 or network errors.
 *
 * Reference:
 * - AC-02.8: If server error, show message and preserve form data
 */
export const serverErrorMessages = {
  errorGenerico: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
  errorRed: 'No se puede conectar al servidor. Verifica tu conexión de internet.',
  timeout: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',
} as const

/**
 * Helper function to map backend HTTP status codes to user-friendly error messages.
 *
 * @param statusCode HTTP status code from backend response
 * @param backendMessage Optional message from backend error response
 * @param context 'username' | 'photo' | 'profile' | 'unknown' — Type of operation that failed
 * @returns User-friendly error message (Spanish string)
 *
 * Example:
 * ```tsx
 * try {
 *   await usuarioPerfilService.actualizarPerfil(payload)
 * } catch (err) {
 *   const message = mapBackendErrorToMessage(err.status, err.message, 'username')
 *   setErrorServidor(message)
 * }
 * ```
 *
 * References:
 * - AC-02.7: Mostrar mensaje claro
 * - AC-02.8: Preservar datos, mostrar error
 */
export function mapBackendErrorToMessage(
  statusCode?: number,
  backendMessage?: string,
  context: 'username' | 'photo' | 'profile' | 'unknown' = 'unknown',
): string {
  // 409 Conflict or 400 Bad Request: Username already exists (A1)
  if (context === 'username' && (statusCode === 409 || statusCode === 400)) {
    return usernameErrorMessages.yaExiste
  }

  // 413 Payload Too Large: File too large (A2)
  if (context === 'photo' && statusCode === 413) {
    return photoErrorMessages.archivoMuyGrande
  }

  // 415 Unsupported Media Type: Invalid format (A2)
  if (context === 'photo' && statusCode === 415) {
    return photoErrorMessages.formatoNoSoportado
  }

  // 400 Bad Request: Could be format or dimensions (A2)
  if (context === 'photo' && statusCode === 400) {
    // If backend provides a message, try to detect specific error
    if (backendMessage?.toLowerCase().includes('dimension')) {
      return photoErrorMessages.dimensionesInvalidas
    }
    if (backendMessage?.toLowerCase().includes('format')) {
      return photoErrorMessages.formatoNoSoportado
    }
    return photoErrorMessages.generico
  }

  // 403 Forbidden or 404 Not Found: Profile not available (A10)
  if (context === 'profile') {
    if (statusCode === 403) {
      return profileAvailabilityErrorMessages.perfilNoDisponible
    }
    if (statusCode === 404) {
      return profileAvailabilityErrorMessages.perfilNoEncontrado
    }
  }

  // 500 Internal Server Error
  if (statusCode === 500) {
    return serverErrorMessages.errorGenerico
  }

  // Network error or unknown status
  return serverErrorMessages.errorGenerico
}

/**
 * Helper function to get validation error for a specific field.
 * Used by EditarPerfilForm to display inline field errors (AC-02.7).
 *
 * @param fieldName 'nombreUsuario' | 'sobreMi' | 'descripcion'
 * @param validationResult Object with { isValid: boolean, error?: string }
 * @returns Error message or empty string if valid
 *
 * Example:
 * ```tsx
 * const errorMsg = getValidationErrorForField('nombreUsuario', validarUsername(valor))
 * setErrores(prev => ({ ...prev, nombreUsuario: errorMsg }))
 * ```
 */
export function getValidationErrorForField(
  fieldName: 'nombreUsuario' | 'sobreMi' | 'descripcion',
  validationResult: { isValid: boolean; error?: string },
): string {
  if (!validationResult.isValid && validationResult.error) {
    return validationResult.error
  }
  return ''
}
