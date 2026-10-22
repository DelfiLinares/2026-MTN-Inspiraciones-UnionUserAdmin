import { LONGITUD_MINIMA_CONTRASENA } from './constantes'
import { ValidacionRecuperacionError } from './EmailRecuperacion'

/** Contraseña nueva con la misma política que el registro (A-5, RF-05). */
export class NuevaContrasena {
  private constructor(readonly valor: string) {}

  /** Devuelve los requisitos que aún no se cumplen (lista vacía = válida). */
  static requisitosFaltantes(bruto: string): string[] {
    const faltantes: string[] = []
    if (bruto.length < LONGITUD_MINIMA_CONTRASENA) {
      faltantes.push(`Al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`)
    }
    if (!/[A-Za-z]/.test(bruto)) faltantes.push('Al menos una letra')
    if (!/\d/.test(bruto)) faltantes.push('Al menos un número')
    if (!/[^A-Za-z0-9]/.test(bruto)) faltantes.push('Al menos un carácter especial')
    return faltantes
  }

  static esValida(bruto: string): boolean {
    return NuevaContrasena.requisitosFaltantes(bruto).length === 0
  }

  static crear(bruto: string, confirmacion: string): NuevaContrasena {
    const faltantes = NuevaContrasena.requisitosFaltantes(bruto)
    if (faltantes.length > 0) {
      throw new ValidacionRecuperacionError(`La contraseña no cumple: ${faltantes.join(', ')}.`)
    }
    if (bruto !== confirmacion) {
      throw new ValidacionRecuperacionError('Las contraseñas no coinciden.')
    }
    return new NuevaContrasena(bruto)
  }
}
