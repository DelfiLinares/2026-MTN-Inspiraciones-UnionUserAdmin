/**
 * Value object Foto
 * 
 * Representa una fotografía de un desafío.
 * 
 * Atributos:
 * - id: identificador único
 * - url: URL de la imagen
 * - formato: JPEG o PNG (A-06)
 * - principal: boolean indicando si es la foto principal
 * 
 * Invariantes:
 * - Un desafío tiene entre 1 y 5 fotos (A-06, RF-02)
 * - Exactamente una foto debe ser principal (A-06, RF-02)
 * - Solo se permiten formatos JPEG o PNG (A-06, CB-11)
 * 
 * Fuente: specs/003-desafios/data-model.md (sección 3.3)
 */

export type FormatoFoto = 'JPEG' | 'PNG'

export interface FotoProps {
  id: string
  url: string
  formato: FormatoFoto
  principal: boolean
}

export class Foto {
  readonly id: string
  readonly url: string
  readonly formato: FormatoFoto
  readonly principal: boolean

  constructor(props: FotoProps) {
    this.id = props.id
    this.url = props.url
    this.formato = props.formato
    this.principal = props.principal
  }

  /**
   * Valida el formato de la foto.
   * Devuelve un objeto con errores por campo si no cumple.
   */
  validar(): Record<string, string> {
    const errores: Record<string, string> = {}

    if (this.formato !== 'JPEG' && this.formato !== 'PNG') {
      errores.formato = 'El formato debe ser JPEG o PNG'
    }

    return errores
  }
}
