/**
 * DTO SubirFotoPayload — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (path: /perfil/foto, multipart/form-data)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-02, A2)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T016)
 *
 * Tipado para upload de foto de perfil con validaciones A2.
 * Usa FormData en lugar de interfaz TypeScript (binary file upload).
 * Validaciones client-side:
 * - Formatos: JPG, JPEG, PNG, WebP (A2)
 * - Tamaño máximo: 5 MB (A2)
 * Backend es authoritative para validaciones finales (A2).
 * 
 * Endpoint: POST /perfil/foto (multipart/form-data)
 * Respuesta: Usuario actualizado
 * Errores: 400 (validación), 401 (no autenticado), 413 (muy grande), 415 (formato no soportado)
 */

/**
 * Constantes de validación para foto de perfil (A2).
 */
export const VALIDACIONES_FOTO = {
  /** Tamaño máximo en MB */
  MAX_SIZE_MB: 5,

  /** Tamaño máximo en bytes */
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB

  /** Formatos MIME aceptados */
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  /** Extensiones aceptadas */
  EXTENSIONES: ['jpg', 'jpeg', 'png', 'webp'],

  /** Mensaje de error para tamaño */
  ERROR_TAMAÑO: `El archivo debe ser menor a ${5} MB`,

  /** Mensaje de error para formato */
  ERROR_FORMATO: 'Formatos aceptados: JPG, PNG, WebP',
}

/**
 * Crear FormData para upload de foto.
 * Usado por servicios HTTP para enviar archivo.
 */
export const crearFormDataFoto = (archivo: File): FormData => {
  const formData = new FormData()
  formData.append('foto', archivo)
  return formData
}

/**
 * Validar archivo de foto antes de envío (client-side, A2).
 * Retorna mensaje de error o null si es válido.
 */
export const validarArchivo = (archivo: File): string | null => {
  // Validar tamaño
  if (archivo.size > VALIDACIONES_FOTO.MAX_SIZE_BYTES) {
    return VALIDACIONES_FOTO.ERROR_TAMAÑO
  }

  // Validar MIME type
  if (!VALIDACIONES_FOTO.MIME_TYPES.includes(archivo.type)) {
    return VALIDACIONES_FOTO.ERROR_FORMATO
  }

  // Validar extensión
  const nombreArchivo = archivo.name.toLowerCase()
  const tieneExtensionValida = VALIDACIONES_FOTO.EXTENSIONES.some((ext) =>
    nombreArchivo.endsWith(`.${ext}`),
  )

  if (!tieneExtensionValida) {
    return VALIDACIONES_FOTO.ERROR_FORMATO
  }

  return null // Válido
}

/**
 * Helper: Obtener texto de orientación para input de foto.
 */
export const obtenerTextoOrientacion = (): string => {
  return `Formatos: JPG, PNG, WebP. Tamaño máximo: ${VALIDACIONES_FOTO.MAX_SIZE_MB} MB.`
}
