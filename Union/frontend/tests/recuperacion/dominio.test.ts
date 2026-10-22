import { describe, it, expect } from 'vitest'
import {
  CodigoErrorRecuperacion,
  CodigoOtp,
  EmailRecuperacion,
  MensajeApelacion,
  NuevaContrasena,
  RecuperacionError,
  mapearErrorRecuperacion,
} from '../../src/domain/recuperacion'

describe('EmailRecuperacion', () => {
  it('recorta y acepta emails válidos', () => {
    expect(EmailRecuperacion.crear('  ana@mail.com ').valor).toBe('ana@mail.com')
  })

  it.each(['', 'sin-arroba', 'a@b', 'a b@c.com', `${'a'.repeat(250)}@x.com`])('rechaza %s', (valor) => {
    expect(EmailRecuperacion.esValido(valor)).toBe(false)
    expect(() => EmailRecuperacion.crear(valor)).toThrow()
  })
})

describe('CodigoOtp', () => {
  it('acepta 6 dígitos y normaliza espacios y guiones', () => {
    expect(CodigoOtp.crear('123 456').valor).toBe('123456')
    expect(CodigoOtp.crear('123-456').valor).toBe('123456')
  })

  it.each(['12345', '1234567', '12a456', ''])('rechaza %s', (valor) => {
    expect(CodigoOtp.esValido(valor)).toBe(false)
    expect(() => CodigoOtp.crear(valor)).toThrow()
  })
})

describe('NuevaContrasena', () => {
  it('acepta una contraseña que cumple la política del registro', () => {
    expect(NuevaContrasena.crear('Abcdef1!', 'Abcdef1!').valor).toBe('Abcdef1!')
  })

  it('informa los requisitos faltantes', () => {
    expect(NuevaContrasena.requisitosFaltantes('abc')).toEqual([
      'Al menos 8 caracteres',
      'Al menos un número',
      'Al menos un carácter especial',
    ])
    expect(NuevaContrasena.requisitosFaltantes('12345678!')).toEqual(['Al menos una letra'])
    expect(NuevaContrasena.requisitosFaltantes('Abcdefg1')).toEqual(['Al menos un carácter especial'])
  })

  it('rechaza si la confirmación no coincide', () => {
    expect(() => NuevaContrasena.crear('Abcdef1!', 'Abcdef1?')).toThrow('no coinciden')
  })
})

describe('MensajeApelacion', () => {
  it('exige entre 20 y 1000 caracteres tras recortar', () => {
    expect(MensajeApelacion.esValido('x'.repeat(19))).toBe(false)
    expect(MensajeApelacion.esValido('x'.repeat(20))).toBe(true)
    expect(MensajeApelacion.esValido('x'.repeat(1000))).toBe(true)
    expect(MensajeApelacion.esValido('x'.repeat(1001))).toBe(false)
    expect(MensajeApelacion.esValido(`   ${'x'.repeat(10)}   `)).toBe(false)
  })
})

describe('mapearErrorRecuperacion', () => {
  const http = (status: number, body?: unknown) => ({ status, body })

  it.each([
    [400, 'OTP_INVALIDO', CodigoErrorRecuperacion.OTP_INVALIDO],
    [400, 'OTP_EXPIRADO', CodigoErrorRecuperacion.OTP_EXPIRADO],
    [400, 'OTP_AGOTADO', CodigoErrorRecuperacion.OTP_AGOTADO],
    [400, 'VALIDATION_ERROR', CodigoErrorRecuperacion.VALIDACION],
    [409, 'APELACION_DUPLICADA', CodigoErrorRecuperacion.APELACION_DUPLICADA],
    [429, 'APELACION_RECHAZO_RECIENTE', CodigoErrorRecuperacion.APELACION_RECHAZO_RECIENTE],
    [403, 'CUENTA_NO_APELABLE', CodigoErrorRecuperacion.CUENTA_NO_APELABLE],
  ])('mapea %i %s', (status, code, esperado) => {
    expect(mapearErrorRecuperacion(http(status, { code })).codigo).toBe(esperado)
  })

  it('usa el estado HTTP cuando no hay código conocido', () => {
    expect(mapearErrorRecuperacion(http(429, {})).codigo).toBe(CodigoErrorRecuperacion.DEMASIADAS_SOLICITUDES)
    expect(mapearErrorRecuperacion(http(401)).codigo).toBe(CodigoErrorRecuperacion.CREDENCIALES_INVALIDAS)
    expect(mapearErrorRecuperacion(http(409)).codigo).toBe(CodigoErrorRecuperacion.APELACION_DUPLICADA)
  })

  it('usa 60 s de espera por defecto en 429 y respeta retryAfterSeconds', () => {
    expect(mapearErrorRecuperacion(http(429, {})).esperaSegundos).toBe(60)
    expect(mapearErrorRecuperacion(http(429, { retryAfterSeconds: 120 })).esperaSegundos).toBe(120)
  })

  it('informa los intentos restantes del OTP', () => {
    const e = mapearErrorRecuperacion(http(400, { code: 'OTP_INVALIDO', intentosRestantes: 1 }))
    expect(e.intentosRestantes).toBe(1)
    expect(e.mensaje).toContain('1 intento.')
  })

  it('trata red caída y 5xx como RED', () => {
    expect(mapearErrorRecuperacion(new TypeError('fetch failed')).codigo).toBe(CodigoErrorRecuperacion.RED)
    expect(mapearErrorRecuperacion(http(503)).codigo).toBe(CodigoErrorRecuperacion.RED)
  })

  it('reutiliza el detalle de un RecuperacionError', () => {
    const detalle = { codigo: CodigoErrorRecuperacion.OTP_EXPIRADO, mensaje: 'x' }
    expect(mapearErrorRecuperacion(new RecuperacionError(detalle))).toBe(detalle)
  })
})
