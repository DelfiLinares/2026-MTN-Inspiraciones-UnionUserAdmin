/**
 * Validación de archivos de publicación en cliente.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-23, RF-24, AC-02.4)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T049)
 *
 * Reglas:
 * - Se valida en cliente únicamente el tipo (extensión / MIME) según el tipo de contenido seleccionado (AC-02.4).
 * - La validación de tamaño máximo queda exclusiva y deliberadamente en el backend (RF-24).
 */

import { TipoContenido } from '../domain/enums/TipoContenido'

const MIME_EXACTOS_POR_TIPO: Partial<Record<TipoContenido, string[]>> = {
  [TipoContenido.IMAGEN]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  [TipoContenido.VIDEO]: ['video/mp4', 'video/webm'],
  [TipoContenido.MUSICA]: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  [TipoContenido.DIGITAL]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  [TipoContenido.ESCULTURA]: ['image/jpeg', 'image/png', 'image/webp', 'model/gltf+json', 'model/gltf-binary'],
}

const PREFIJOS_MIME_POR_TIPO: Partial<Record<TipoContenido, string[]>> = {
  [TipoContenido.IMAGEN]: ['image/'],
  [TipoContenido.VIDEO]: ['video/'],
  [TipoContenido.MUSICA]: ['audio/'],
  [TipoContenido.TUTORIAL]: ['text/', 'application/pdf', 'video/mp4'],
  [TipoContenido.DIGITAL]: ['image/'],
  [TipoContenido.ESCULTURA]: ['image/', 'model/'],
}

const EXTENSIONES_POR_TIPO: Record<TipoContenido, string[]> = {
  [TipoContenido.IMAGEN]: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  [TipoContenido.VIDEO]: ['.mp4', '.webm'],
  [TipoContenido.MUSICA]: ['.mp3', '.wav', '.ogg'],
  [TipoContenido.TUTORIAL]: ['.pdf', '.txt', '.md', '.mp4'],
  [TipoContenido.DIGITAL]: ['.png', '.jpg', '.jpeg', '.svg', '.webp'],
  [TipoContenido.ESCULTURA]: ['.jpg', '.jpeg', '.png', '.gltf', '.glb'],
}

/**
 * Valida si un tipo MIME es admisible para el `TipoContenido` dado.
 */
export function esTipoArchivoValido(mimeType: string, tipoContenido: TipoContenido): boolean {
  if (!mimeType) {
    return false
  }

  const mimeExactos = MIME_EXACTOS_POR_TIPO[tipoContenido]
  if (mimeExactos && mimeExactos.includes(mimeType)) {
    return true
  }

  const prefijosPermitidos = PREFIJOS_MIME_POR_TIPO[tipoContenido]
  if (prefijosPermitidos && prefijosPermitidos.some((prefijo) => mimeType.startsWith(prefijo))) {
    return true
  }

  return false
}

/**
 * Valida si el nombre de archivo o extensión es admisible para el `TipoContenido`.
 */
export function esExtensionValida(nombreArchivo: string, tipoContenido: TipoContenido): boolean {
  if (!nombreArchivo) {
    return false
  }
  const extensiones = EXTENSIONES_POR_TIPO[tipoContenido]
  if (!extensiones) {
    return false
  }
  const extension = nombreArchivo.slice(nombreArchivo.lastIndexOf('.')).toLowerCase()
  return extensiones.includes(extension)
}

/**
 * Valida un objeto File o Blob según el TipoContenido.
 */
export function validarArchivo(archivo: File | Blob, tipoContenido: TipoContenido): {
  esValido: boolean
  mensajeError?: string
} {
  const mimeValido = esTipoArchivoValido(archivo.type, tipoContenido)

  // Si tiene nombre (File) se valida también la extensión si el mimeType es genérico o vacío
  const nombre = 'name' in archivo ? (archivo as File).name : ''
  const extensionValida = nombre ? esExtensionValida(nombre, tipoContenido) : true

  if (!mimeValido && !extensionValida) {
    return {
      esValido: false,
      mensajeError: `El tipo de archivo (${archivo.type || 'desconocido'}) no es válido para el contenido seleccionado.`,
    }
  }

  return { esValido: true }
}

export const archivoValidacion = {
  esTipoArchivoValido,
  esExtensionValida,
  validarArchivo,
}
