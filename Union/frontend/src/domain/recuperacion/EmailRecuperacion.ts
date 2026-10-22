import { LONGITUD_MAXIMA_EMAIL } from './constantes'

export class ValidacionRecuperacionError extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ValidacionRecuperacionError'
  }
}

const PATRON_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/** Email recortado y con formato válido (RF-03). La normalización final es del backend. */
export class EmailRecuperacion {
  private constructor(readonly valor: string) {}

  static esValido(bruto: string): boolean {
    const limpio = bruto.trim()
    return limpio.length > 0 && limpio.length <= LONGITUD_MAXIMA_EMAIL && PATRON_EMAIL.test(limpio)
  }

  static crear(bruto: string): EmailRecuperacion {
    if (!EmailRecuperacion.esValido(bruto)) {
      throw new ValidacionRecuperacionError('Ingresá un correo electrónico válido.')
    }
    return new EmailRecuperacion(bruto.trim())
  }
}
