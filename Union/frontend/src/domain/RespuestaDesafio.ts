import { TipoContenidoRespuesta } from './Desafio'

export type FormatoContenido = 'JPEG' | 'PNG' | 'MP4' | 'WebM' | 'MP3' | 'WAV'

export interface ContenidoRespuestaBase {
  id: string
  url: string
  formato: FormatoContenido
}

export interface ContenidoImagenRespuesta extends ContenidoRespuestaBase {
  tipo: 'imagen'
  formato: 'JPEG' | 'PNG'
}

export interface ContenidoVideoRespuesta extends ContenidoRespuestaBase {
  tipo: 'video'
  formato: 'MP4' | 'WebM'
}

export interface ContenidoAudioRespuesta extends ContenidoRespuestaBase {
  tipo: 'audio'
  formato: 'MP3' | 'WAV'
}

export type ContenidoRespuesta = ContenidoImagenRespuesta | ContenidoVideoRespuesta | ContenidoAudioRespuesta

export interface RespuestaDesafioProps {
  id?: string
  desafioId?: string
  autorId?: string
  contenido?: ContenidoRespuesta
  version?: number
}

/**
 * Entidad de dominio RespuestaDesafio (T015, T055)
 *
 * Representa una respuesta (publicación) a un desafío.
 * Las respuestas son publicaciones normales que:
 * - Aparecen en la vista de respuestas del desafío
 * - Aparecen en el perfil del autor
 * - Aparecen en el feed (FYP) de personas que siguen al autor
 *
 * El contenido puede ser: imagen, video o audio (A-22)
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/data-model.md (sección 4.3)
 * - Union/specs/003-desafios/spec.md (A-22 RESUELTO)
 * - Union/specs/003-desafios/tasks.md (T015, T055)
 */
export class RespuestaDesafio {
  readonly id?: string
  readonly desafioId?: string
  readonly autorId?: string
  readonly contenido?: ContenidoRespuesta
  readonly version?: number

  constructor(props: RespuestaDesafioProps) {
    this.id = props.id || `respuesta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.desafioId = props.desafioId
    this.autorId = props.autorId
    this.contenido = props.contenido
    this.version = props.version
  }

  /**
   * Valida el contenido de la respuesta.
   * 
   * Devuelve un objeto con errores por campo:
   * - contenido: requerido, formato válido
   * - tipo: debe ser imagen, video o audio
   * - formato: debe ser el correcto para el tipo
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.3, método validar)
   * Reglas: HU-14, RF-12, RF-13, A-22
   */
  validar(formatosAceptados?: TipoContenidoRespuesta[]): Record<string, string> {
    const errores: Record<string, string> = {}

    // Validar desafioId
    if (!this.desafioId) {
      errores.desafioId = 'Se requiere especificar el desafío'
    }

    // Validar autorId
    if (!this.autorId) {
      errores.autorId = 'Se requiere especificar el autor'
    }

    // Validar que haya contenido
    if (!this.contenido) {
      errores.contenido = 'Se requiere adjuntar contenido (imagen, video o audio)'
      return errores
    }

    // Validar que el contenido tenga id y url
    if (!this.contenido.id) {
      errores.contenido = 'El contenido debe tener un id'
      return errores
    }

    if (!this.contenido.url) {
      errores.contenido = 'El contenido debe tener una URL'
      return errores
    }

    // Validar tipo de contenido
    const tiposValidos: TipoContenidoRespuesta[] = ['imagen', 'video', 'audio']
    if (!tiposValidos.includes(this.contenido.tipo as TipoContenidoRespuesta)) {
      errores.contenido = 'El tipo de contenido no es válido'
      return errores
    }

    // Validar formato según tipo
    const formatosPorTipo: Record<TipoContenidoRespuesta, FormatoContenido[]> = {
      imagen: ['JPEG', 'PNG'],
      video: ['MP4', 'WebM'],
      audio: ['MP3', 'WAV'],
    }

    const formatosEsperados = formatosPorTipo[this.contenido.tipo as TipoContenidoRespuesta]
    if (formatosEsperados && !formatosEsperados.includes(this.contenido.formato)) {
      errores.contenido = `El formato ${this.contenido.formato} no es válido para ${this.contenido.tipo}`
      return errores
    }

    // Validar que el tipo sea aceptado por el desafío
    if (formatosAceptados && formatosAceptados.length > 0) {
      if (!formatosAceptados.includes(this.contenido.tipo as TipoContenidoRespuesta)) {
        errores.contenido = `El desafío solo acepta: ${formatosAceptados.join(', ')}`
      }
    }

    return errores
  }

  /**
   * Determina si el usuario actual puede editar la respuesta.
   * Solo el autor puede editar (nunca el admin).
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.3, método puedeEditarPor)
   * Reglas: HU-15, RF-13, clarificación 2026-10-11
   */
  puedeEditarPor(sesion: { usuarioId: string; rol: 'USER' | 'ADMIN' }): boolean {
    // Solo el autor puede editar, NUNCA el admin
    return sesion.usuarioId === this.autorId
  }

  /**
   * Determina si el usuario actual puede eliminar la respuesta.
   * El autor o un ADMIN pueden eliminar.
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.3, método puedeEliminarPor)
   * Reglas: HU-15, HU-16, RF-13, RF-14
   */
  puedeEliminarPor(sesion: { usuarioId: string; rol: 'USER' | 'ADMIN' }): boolean {
    return sesion.rol === 'ADMIN' || sesion.usuarioId === this.autorId
  }
}
