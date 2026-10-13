/**
 * `carpetaErrorMessages`: Centralized error messages for folder (carpeta) operations.
 *
 * Sources of truth:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, AC-05.1–AC-05.5, AC-06.1–AC-06.5, AC-07.1–AC-07.7, A3, A6, A7)
 * - Union/specs/004-inspiraciones-perfil/clarifications.md (A3, A6, A7 resolutions)
 * - Union/specs/004-inspiraciones-perfil/research.md (sections 5, 8, 9)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (error handling table)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T067)
 *
 * Responsibilities:
 * 1. Centralize error messages for folder operations (T067):
 *    - A3: Folder name uniqueness validation (backend enforces per user)
 *    - A6: Pagination responsibility (server-side, not error message, but context)
 *    - A7: Folder deletion with content inside (warning message, not error)
 *    - Folder name validation (AC-05.2, AC-06.1)
 *    - 50-folder limit (AC-05.4, RF-22, RF-23)
 *
 * 2. Support AC-05.3 (clear message if validation fails):
 *    - Client-side validation errors (empty name, exceeds 15 chars)
 *    - Backend error handling (409 for duplicate names, 400/403 for limits)
 *
 * 3. Support AC-07.2–AC-07.3 (clear warning on deletion):
 *    - Message explaining that posts remain but folder is deleted
 *    - Visual differentiation (warning/danger variant)
 *
 * 4. Support A7 (folder deletion with content):
 *    - Clear warning message about saved posts being orphaned
 *
 * Error categories:
 * - **Validation errors** (AC-05.2, AC-06.1): Name format, length
 * - **Uniqueness errors** (A3): Folder name already exists (409 from backend)
 * - **Limit errors** (RF-22, RF-23): User has 50 folders, cannot create more
 * - **Deletion warnings** (A7): Content will be lost from folder but posts remain
 * - **Server errors**: 500, network timeout
 *
 * Dependencies:
 * - T042: CreateCarpetaDialog (uses validation error messages)
 * - T043: RenameCarpetaDialog (uses validation + uniqueness error messages)
 * - T044: ConfirmDeleteCarpetaDialog (uses deletion warning messages)
 *
 * Historias de usuario:
 * - HU-05: Crear carpeta (validaciones AC-05.1–AC-05.5, límite 50)
 * - HU-06: Renombrar carpeta (validaciones AC-06.1–AC-06.5, A3)
 * - HU-07: Eliminar carpeta (advertencias AC-07.1–AC-07.7, A7)
 * - HU-08: Visualizar lista de carpetas (paginación A6)
 *
 * Acceptance criteria:
 * - AC-05.2: Nombre no supera 15 caracteres, permite espacios
 * - AC-05.3: Si nombre vacío o excede límite, mostrar mensaje claro
 * - AC-05.4: Si usuario tiene 50 carpetas, crear queda impedida
 * - AC-06.1: Renombrar aplica mismas reglas que crear
 * - AC-06.2: Renombrar requiere confirmación explícita
 * - AC-07.1: Eliminar requiere confirmación explícita
 * - AC-07.2: Confirmación advierte que contenido guardado se perderá
 * - AC-07.3: Confirmación aclara que posts originales no se eliminan
 * - A3: Nombre de carpeta UNIQUE per usuario (no globalmente)
 * - A6: Paginación server-side (no error message, pero contexto)
 * - A7: Carpeta se PUEDE eliminar con posts dentro; posts persisten
 *
 * Clarifications:
 * - A3: Backend enforces uniqueness per user (409 Conflict if duplicate)
 * - A6: Pagination is server-side; frontend shows paginated results
 * - A7: Deletion does NOT delete posts; only removes folder and its references
 *
 * Notes:
 * - All messages are user-friendly Spanish strings
 * - Deletion warnings use variant='advertencia' or 'peligro' in modal
 * - Backend errors are captured and re-mapped to user-friendly messages
 * - T067: Reusable across T070 (rename confirmation), T071 (delete confirmation)
 */

/**
 * Client-side validation error messages (AC-05.2, AC-05.3, AC-06.1).
 * These are shown when form validation fails BEFORE sending to backend.
 *
 * References:
 * - AC-05.2: Nombre no supera 15 caracteres, permite espacios
 * - AC-05.3: Si nombre vacío o excede límite, mostrar mensaje claro
 * - AC-06.1: Renombrar aplica mismas reglas que crear
 */
export const validationErrorMessages = {
  // Folder name validation (AC-05.2, AC-06.1)
  nombreRequerido: 'El nombre de la carpeta es requerido',
  nombreTooLong: 'El nombre de la carpeta no debe superar 15 caracteres',

  // General validation error (AC-05.3)
  validacionFallo: 'No hay cambios para guardar',
} as const

/**
 * Backend error messages for A3 (folder name uniqueness per user).
 * Returned as 409 Conflict when folder name already exists for this user.
 *
 * Reference:
 * - A3: Backend enforces uniqueness constraint per user; frontend displays error
 * - AC-06.2: Rename requires confirmation modal before sending to backend
 * - AC-05.3: If 409, preserve form data and show error inline
 */
export const uniquenessErrorMessages = {
  // A3: Folder name already exists (for this user)
  nombreDuplicado: 'Ya existe una carpeta con ese nombre',

  // Generic uniqueness error (fallback if backend returns unexpected format)
  generico: 'No se puede cambiar el nombre de la carpeta. Por favor, intenta de nuevo.',
} as const

/**
 * Backend error messages for 50-folder limit (AC-05.4, RF-22, RF-23).
 * Returned as 400/403 Forbidden when user attempts to exceed limit.
 *
 * Reference:
 * - RF-22: User MUST NOT have more than 50 folders
 * - RF-23: Frontend MUST prevent creation when limit is reached
 * - AC-05.4: If user has 50 folders, create action is blocked with clear message
 * - CB-08: "El usuario ya tiene 50 carpetas e intenta crear otra. La acción de crear queda impedida."
 */
export const limitErrorMessages = {
  // 400/403: Folder limit exceeded
  limitAlcanzado:
    'Has alcanzado el límite de 50 carpetas. Elimina una para crear otra.',

  // Generic limit error (fallback if backend returns unexpected format)
  generico: 'No se puede crear la carpeta. Por favor, intenta de nuevo.',
} as const

/**
 * Deletion confirmation warning messages (A7, AC-07.1–AC-07.3).
 * NOT errors, but warnings shown in ConfirmDeleteCarpetaDialog BEFORE confirming deletion.
 *
 * Reference:
 * - A7: Folder CAN be deleted with posts inside; posts are NOT deleted
 * - AC-07.1: Deletion requires explicit confirmation
 * - AC-07.2: Confirmation WARNS that saved content in folder will be lost
 * - AC-07.3: Confirmation CLARIFIES that original posts are NOT deleted from platform
 * - AC-07.7: Delete action is visually differentiated (use variant='peligro' in modal)
 */
export const deletionWarningMessages = {
  // AC-07.2: Main warning
  advertenciaContenido:
    'Se eliminarán todos los posts guardados en esta carpeta,\npero los posts originales seguirán en la plataforma.',

  // AC-07.3: Clarification text (secondary)
  aclaracionPosts:
    'Los posts no se eliminan, solo se elimina la carpeta.',

  // Combined title for confirmation modal (use in ConfirmacionAccionSensibleModal)
  tituloConfirmacion: '¿Eliminar esta carpeta?',

  // Button text (typically "Eliminar" in modal, but can override here if needed)
  botonEliminar: 'Eliminar',
} as const

/**
 * Generic server error messages.
 * Returned for unexpected 500 or network errors.
 *
 * Reference:
 * - AC-05.3: If server error, show message and preserve form data
 */
export const serverErrorMessages = {
  errorGenerico:
    'Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
  errorRed: 'No se puede conectar al servidor. Verifica tu conexión de internet.',
  timeout: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',
} as const

/**
 * Helper function to map backend HTTP status codes to user-friendly error messages.
 *
 * @param statusCode HTTP status code from backend response
 * @param backendMessage Optional message from backend error response
 * @param context 'create' | 'rename' | 'delete' | 'list' | 'unknown' — Type of operation that failed
 * @returns User-friendly error message (Spanish string)
 *
 * Example:
 * ```tsx
 * try {
 *   await carpetaService.crearCarpeta(nombre)
 * } catch (err) {
 *   const message = mapBackendErrorToMessage(err.status, err.message, 'create')
 *   setErrorServidor(message)
 * }
 * ```
 *
 * Reference:
 * - AC-05.3: Mostrar mensaje claro
 */
export function mapBackendErrorToMessage(
  statusCode?: number,
  backendMessage?: string,
  context: 'create' | 'rename' | 'delete' | 'list' | 'unknown' = 'unknown',
): string {
  // 409 Conflict: Folder name already exists (A3)
  if ((statusCode === 409) && (context === 'create' || context === 'rename')) {
    return uniquenessErrorMessages.nombreDuplicado
  }

  // 400/403 Forbidden: 50-folder limit exceeded (RF-22, RF-23)
  if ((statusCode === 400 || statusCode === 403) && context === 'create') {
    // Check if backend message indicates limit
    if (backendMessage?.toLowerCase().includes('limit') || backendMessage?.toLowerCase().includes('50')) {
      return limitErrorMessages.limitAlcanzado
    }
    return limitErrorMessages.generico
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
 * Used by CreateCarpetaDialog and RenameCarpetaDialog to display inline field errors (AC-05.3, AC-06.1).
 *
 * @param fieldName 'nombre' — The field that failed validation
 * @param validationResult Object with { isValid: boolean, error?: string }
 * @returns Error message or empty string if valid
 *
 * Example:
 * ```tsx
 * const errorMsg = getValidationErrorForField('nombre', validarNombre(valor))
 * setErrores(prev => ({ ...prev, nombre: errorMsg }))
 * ```
 */
export function getValidationErrorForField(
  fieldName: 'nombre',
  validationResult: { isValid: boolean; error?: string },
): string {
  if (!validationResult.isValid && validationResult.error) {
    return validationResult.error
  }
  return ''
}

/**
 * Helper function to build deletion confirmation message for ConfirmacionAccionSensibleModal.
 *
 * @param nombreCarpeta The name of the folder being deleted
 * @returns Object with { titulo, mensaje } for modal
 *
 * Example:
 * ```tsx
 * const { titulo, mensaje } = getDeleteConfirmationContent('Favoritos')
 * setConfirmacion({ titulo, mensaje, ...rest })
 * ```
 *
 * Reference:
 * - A7: Folder deletion with content
 * - AC-07.1, AC-07.2, AC-07.3
 */
export function getDeleteConfirmationContent(nombreCarpeta: string): {
  titulo: string
  mensaje: string
} {
  return {
    titulo: deletionWarningMessages.tituloConfirmacion,
    mensaje: `Se eliminarán todos los posts guardados en "${nombreCarpeta}",\npero los posts originales seguirán en la plataforma.`,
  }
}
