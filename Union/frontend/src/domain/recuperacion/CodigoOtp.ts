import { LONGITUD_CODIGO_OTP } from './constantes'
import { ValidacionRecuperacionError } from './EmailRecuperacion'

/** Código OTP de exactamente 6 dígitos; ignora espacios y guiones al pegar (RF-04). */
export class CodigoOtp {
  private constructor(readonly valor: string) {}

  static normalizar(bruto: string): string {
    return bruto.replace(/[\s-]/g, '')
  }

  static esValido(bruto: string): boolean {
    return new RegExp(`^\\d{${LONGITUD_CODIGO_OTP}}$`).test(CodigoOtp.normalizar(bruto))
  }

  static crear(bruto: string): CodigoOtp {
    if (!CodigoOtp.esValido(bruto)) {
      throw new ValidacionRecuperacionError(`El código debe tener ${LONGITUD_CODIGO_OTP} dígitos.`)
    }
    return new CodigoOtp(CodigoOtp.normalizar(bruto))
  }
}
