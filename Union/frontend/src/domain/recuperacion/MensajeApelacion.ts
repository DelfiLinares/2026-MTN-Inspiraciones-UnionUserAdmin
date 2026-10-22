import {
  LONGITUD_MAXIMA_MENSAJE_APELACION,
  LONGITUD_MINIMA_MENSAJE_APELACION,
} from './constantes'
import { ValidacionRecuperacionError } from './EmailRecuperacion'

/** Mensaje de apelación de 20 a 1000 caracteres tras recortar (A-8). */
export class MensajeApelacion {
  private constructor(readonly valor: string) {}

  static esValido(bruto: string): boolean {
    const largo = bruto.trim().length
    return largo >= LONGITUD_MINIMA_MENSAJE_APELACION && largo <= LONGITUD_MAXIMA_MENSAJE_APELACION
  }

  static crear(bruto: string): MensajeApelacion {
    if (!MensajeApelacion.esValido(bruto)) {
      throw new ValidacionRecuperacionError(
        `El mensaje debe tener entre ${LONGITUD_MINIMA_MENSAJE_APELACION} y ${LONGITUD_MAXIMA_MENSAJE_APELACION} caracteres.`,
      )
    }
    return new MensajeApelacion(bruto.trim())
  }
}
