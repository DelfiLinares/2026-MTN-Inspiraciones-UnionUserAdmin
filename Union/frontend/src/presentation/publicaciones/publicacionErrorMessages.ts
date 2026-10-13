/**
 * `publicacionErrorMessages`: Centralized error messages for post (publicación) operations.
 *
 * Sources of truth:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-11, HU-12, HU-09, AC-11.1–AC-11.4, AC-12.1–AC-12.4, AC-09.1–AC-09.3, A5, A8)
 * - Union/specs/004-inspiraciones-perfil/clarifications.md (A5, A8 resolutions)
 * - Union/specs/004-inspiraciones-perfil/research.md (sections 7, 10)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (error handling table)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T068)
 *
 * Responsibilities:
 * 1. Centralize error messages for post operations (T068):
 *    - A5: Only text is editable; images cannot be changed (immutable)
 *    - A8: Saving already-saved post to same folder is idempotent (no error)
 *    - HU-11: Edit post validations and error handling
 *    - HU-12: Delete post validation and warnings
 *    - HU-09: Save post validations (including idempotency success)
 *
 * 2. Support AC-11.4 (error handling in edit):
 *    - Client-side validation errors
 *    - Backend error handling (400, 403, 404, 500)
 *
 * 3. Support AC-12.2–AC-12.4 (deletion confirmation and warnings):
 *    - Explicit confirmation message
 *    - Visual differentiation (danger variant)
 *
 * 4. Support A8 (idempotent save):
 *    - Success message when post already in folder
 *    - NOT an error, but success message with idempotency info
 *
 * Error categories:
 * - **Validation errors** (A5): Text content validation
 * - **Edit errors** (A5, HU-11): Cannot edit images, text validation
 * - **Delete warnings** (HU-12): Confirmation and visual distinction
 * - **Save errors/success** (A8, HU-09): Idempotent success when duplicate
 * - **Server errors**: 400, 403, 404, 500
 *
 * Dependencies:
 * - T053: EditPostForm (uses validation error messages for text)
 * - T054: ConfirmDeletePostDialog (uses deletion warning messages)
 * - T055: SavePostToCarpetaDialog (uses idempotent save success message)
 *
 * Historias de usuario:
 * - HU-11: Editar publicación propia (validaciones AC-11.1–AC-11.4, A5)
 * - HU-12: Eliminar publicación propia (AC-12.1–AC-12.4)
 * - HU-09: Guardar post en carpeta (AC-09.1–AC-09.3, A8)
 *
 * Acceptance criteria:
 * - AC-11.1: Edit only available on own posts
 * - AC-11.2: Edit requires explicit confirmation
 * - AC-11.3: After successful edit, profile shows updated content
 * - AC-11.4: If error, show message and preserve edited content in form
 * - AC-12.1: Delete only available on own posts
 * - AC-12.2: Delete requires explicit confirmation
 * - AC-12.3: After successful delete, post disappears from profile
 * - AC-12.4: Delete action is visually differentiated
 * - AC-09.1: Save requires selecting a folder
 * - AC-09.2: Post added to folder
 * - AC-09.3: If post already in folder, idempotent (no error)
 * - A5: Only text is editable (images immutable)
 * - A8: Save already-saved post → success (idempotent), no duplicate
 *
 * Clarifications:
 * - A5: Backend accepts only text updates; image fields ignored
 * - A8: Save operation is idempotent; repeated saves don't create duplicates
 *
 * Notes:
 * - All messages are user-friendly Spanish strings
 * - Delete warnings use variant='peligro' in modal
 * - Save success includes idempotency message when appropriate
 * - T068: Reusable across T069–T071 (confirmation integration)
 */

/**
 * Client-side validation error messages (A5, HU-11).
 * These are shown when form validation fails BEFORE sending to backend.
 *
 * References:
 * - A5: Only text is editable in posts
 * - AC-11.4: If validation fails, show message and preserve content
 */
export const validationErrorMessages = {
  // Post text validation
  textoRequerido: 'El texto de la publicación es requerido',
  
  // Generic validation error (AC-11.4)
  validacionFallo: 'No hay cambios para guardar',
} as const

/**
 * Backend error messages for edit operations (A5, HU-11).
 * Returned as 400, 403, 404, or 500 when edit fails.
 *
 * Reference:
 * - A5: Only text is editable
 * - AC-11.4: If server error, show message and preserve form data
 */
export const editErrorMessages = {
  // 404: Post not found or doesn't belong to user
  publicacionNoEncontrada: 'No se encontró la publicación',

  // 403: User is not owner of post
  noEsPublicacionPropia: 'No puedes editar una publicación que no es tuya',

  // 400: Content validation error (e.g., text too long)
  contenidoInvalido: 'El contenido de la publicación no es válido',

  // Generic edit error (fallback)
  generico: 'No se puede editar la publicación. Por favor, intenta de nuevo.',
} as const

/**
 * Backend error messages for delete operations (HU-12).
 * Returned as 400, 403, 404, or 500 when delete fails.
 *
 * Reference:
 * - AC-12.2: Delete requires confirmation
 * - AC-12.4: Delete action visually differentiated (use variant='peligro')
 */
export const deleteErrorMessages = {
  // 404: Post not found or doesn't belong to user
  publicacionNoEncontrada: 'No se encontró la publicación',

  // 403: User is not owner of post
  noEsPublicacionPropia: 'No puedes eliminar una publicación que no es tuya',

  // Generic delete error (fallback)
  generico: 'No se puede eliminar la publicación. Por favor, intenta de nuevo.',
} as const

/**
 * Deletion confirmation warning messages (HU-12, AC-12.1–AC-12.4).
 * NOT errors, but warnings shown in ConfirmDeletePostDialog BEFORE confirming deletion.
 *
 * Reference:
 * - AC-12.2: Delete requires explicit confirmation
 * - AC-12.4: Delete action visually differentiated (use variant='peligro')
 */
export const deletionWarningMessages = {
  // Title for confirmation modal (use in ConfirmacionAccionSensibleModal)
  tituloConfirmacion: '¿Eliminar esta publicación?',

  // Warning content
  advertencia: 'Una vez eliminada, no podrás recuperar esta publicación.',

  // Button text
  botonEliminar: 'Eliminar',
} as const

/**
 * Save post to folder messages (A8, HU-09, AC-09.1–AC-09.3).
 * Includes idempotent success message when post already in folder.
 *
 * Reference:
 * - A8: Save is idempotent; saving already-saved post succeeds
 * - AC-09.3: If post already saved in folder, idempotent (no error)
 */
export const saveToFolderMessages = {
  // Success when post is newly saved (201 Created)
  exitoNuevo: '✅ Publicación guardada en la carpeta',

  // Success when post already in folder (200 OK, idempotent)
  // A8: Shows success message even if already saved (idempotency)
  exitoYaGuardado: '✅ El post ya está guardado en esta carpeta',

  // Validation errors
  carpetaRequerida: 'Debes seleccionar una carpeta',
  publicacionNoEncontrada: 'No se encontró la publicación',

  // Error messages
  generico: 'No se puede guardar la publicación. Por favor, intenta de nuevo.',
  errorRed: 'No se puede conectar al servidor. Verifica tu conexión de internet.',
} as const

/**
 * Generic server error messages.
 * Returned for unexpected 500 or network errors.
 *
 * Reference:
 * - AC-11.4: If server error, show message and preserve form data
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
 * @param context 'edit' | 'delete' | 'save' | 'unknown' — Type of operation that failed
 * @returns User-friendly error message (Spanish string)
 *
 * Example:
 * ```tsx
 * try {
 *   await publicacionService.editarPost(postId, nuevoTexto)
 * } catch (err) {
 *   const message = mapBackendErrorToMessage(err.status, err.message, 'edit')
 *   setErrorServidor(message)
 * }
 * ```
 *
 * Reference:
 * - AC-11.4: Mostrar mensaje claro si error servidor
 */
export function mapBackendErrorToMessage(
  statusCode?: number,
  backendMessage?: string,
  context: 'edit' | 'delete' | 'save' | 'unknown' = 'unknown',
): string {
  // 404: Post not found (both edit and delete)
  if (statusCode === 404) {
    return context === 'delete'
      ? deleteErrorMessages.publicacionNoEncontrada
      : context === 'edit'
        ? editErrorMessages.publicacionNoEncontrada
        : saveToFolderMessages.publicacionNoEncontrada
  }

  // 403: Forbidden (user is not owner)
  if (statusCode === 403) {
    return context === 'delete'
      ? deleteErrorMessages.noEsPublicacionPropia
      : context === 'edit'
        ? editErrorMessages.noEsPublicacionPropia
        : serverErrorMessages.errorGenerico
  }

  // 400: Bad request (validation error)
  if (statusCode === 400) {
    if (context === 'edit') {
      return editErrorMessages.contenidoInvalido
    }
    return context === 'delete'
      ? deleteErrorMessages.generico
      : saveToFolderMessages.generico
  }

  // 500: Internal server error
  if (statusCode === 500) {
    return serverErrorMessages.errorGenerico
  }

  // Network error or unknown status
  return serverErrorMessages.errorGenerico
}

/**
 * Helper function to get validation error for a specific field.
 * Used by EditPostForm to display inline field errors.
 *
 * @param fieldName 'texto' — The field that failed validation
 * @param validationResult Object with { isValid: boolean, error?: string }
 * @returns Error message or empty string if valid
 *
 * Example:
 * ```tsx
 * const errorMsg = getValidationErrorForField('texto', validarTexto(valor))
 * setErrores(prev => ({ ...prev, texto: errorMsg }))
 * ```
 */
export function getValidationErrorForField(
  fieldName: 'texto',
  validationResult: { isValid: boolean; error?: string },
): string {
  if (!validationResult.isValid && validationResult.error) {
    return validationResult.error
  }
  return ''
}

/**
 * Helper function to get save success message.
 * Checks if post was already saved (idempotent case) or newly saved.
 *
 * @param wasAlreadySaved boolean — Whether post was already in folder
 * @returns Success message string
 *
 * Example:
 * ```tsx
 * const { wasAlreadySaved } = response
 * const mensaje = getSaveSuccessMessage(wasAlreadySaved)
 * showToast(mensaje)
 * ```
 *
 * Reference:
 * - A8: Idempotent save; show appropriate message for both cases
 */
export function getSaveSuccessMessage(wasAlreadySaved: boolean): string {
  return wasAlreadySaved
    ? saveToFolderMessages.exitoYaGuardado
    : saveToFolderMessages.exitoNuevo
}

/**
 * Helper function to build delete confirmation message for ConfirmacionAccionSensibleModal.
 *
 * @returns Object with { titulo, mensaje } for modal
 *
 * Example:
 * ```tsx
 * const { titulo, mensaje } = getDeleteConfirmationContent()
 * setConfirmacion({ titulo, mensaje, variante: 'peligro', ...rest })
 * ```
 *
 * Reference:
 * - AC-12.2: Delete requires explicit confirmation
 * - AC-12.4: Delete action visually differentiated
 */
export function getDeleteConfirmationContent(): {
  titulo: string
  mensaje: string
} {
  return {
    titulo: deletionWarningMessages.tituloConfirmacion,
    mensaje: deletionWarningMessages.advertencia,
  }
}

/**
 * Constants for immutability rules (A5).
 * Used by EditPostForm to display read-only image section.
 *
 * Reference:
 * - A5: Only text is editable; images cannot be changed
 */
export const editabilityRules = {
  // Message for read-only image section
  imagenNoEditable: 'La imagen no puede ser modificada después de publicar',

  // Explanatory text (optional, for UI guidance)
  soloTextoEditable: 'Puedes editar solo el texto de tu publicación',
} as const
