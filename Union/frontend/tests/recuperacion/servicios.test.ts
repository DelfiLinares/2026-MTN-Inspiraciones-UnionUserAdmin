import { describe, it, expect, vi } from 'vitest'
import { crearRecoveryService } from '../../src/application/recoveryService'
import { crearAppealsAdminService } from '../../src/application/appealsAdminService'
import { CodigoErrorRecuperacion, EstadoApelacion, RecuperacionError } from '../../src/domain/recuperacion'
import type { HttpClient } from '../../src/application/ports/HttpClient'

function crearHttp(post: unknown = vi.fn().mockResolvedValue(undefined)) {
  return {
    get: vi.fn().mockResolvedValue({ contenido: [], pagina: 0, tamanio: 20, totalElementos: 0 }),
    post,
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient & { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> }
}

const rechazo = (status: number, body: unknown = {}) => Object.assign(new Error('http'), { status, body })

describe('recoveryService.solicitarCodigo', () => {
  it('envía el email recortado al endpoint de solicitud', async () => {
    const http = crearHttp()
    const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
    await service.solicitarCodigo('  ana@mail.com ')
    expect(http.post).toHaveBeenCalledWith('/auth/password-reset/request', { email: 'ana@mail.com' })
  })

  it('no llama a la API con un email inválido', async () => {
    const http = crearHttp()
    const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
    await expect(service.solicitarCodigo('nope')).rejects.toThrow()
    expect(http.post).not.toHaveBeenCalled()
  })

  it.each([400, 404])('responde como éxito ante %i para no revelar cuentas (RF-02)', async (status) => {
    const http = crearHttp(vi.fn().mockRejectedValue(rechazo(status)))
    const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
    await expect(service.solicitarCodigo('ana@mail.com')).resolves.toBeUndefined()
  })

  it('propaga 429 con tiempo de espera', async () => {
    const http = crearHttp(vi.fn().mockRejectedValue(rechazo(429, { retryAfterSeconds: 30 })))
    const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
    const error = await service.solicitarCodigo('ana@mail.com').catch((e) => e)
    expect(error).toBeInstanceOf(RecuperacionError)
    expect(error.detalle.codigo).toBe(CodigoErrorRecuperacion.DEMASIADAS_SOLICITUDES)
    expect(error.detalle.esperaSegundos).toBe(30)
  })

  it('reporta error de red y 5xx como RED (RF-14)', async () => {
    for (const fallo of [new TypeError('fetch failed'), rechazo(500)]) {
      const http = crearHttp(vi.fn().mockRejectedValue(fallo))
      const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
      const error = await service.solicitarCodigo('ana@mail.com').catch((e) => e)
      expect(error.detalle.codigo).toBe(CodigoErrorRecuperacion.RED)
    }
  })
})

describe('recoveryService.confirmar', () => {
  const datos = { email: 'ana@mail.com', codigo: '123 456', nuevaContrasena: 'Abcdef1!', confirmacion: 'Abcdef1!' }

  it('envía el payload del contrato y limpia la sesión local en éxito', async () => {
    const http = crearHttp()
    const limpiarSesionLocal = vi.fn()
    await crearRecoveryService({ http, limpiarSesionLocal }).confirmar(datos)
    expect(http.post).toHaveBeenCalledWith('/auth/password-reset/confirm', {
      email: 'ana@mail.com',
      code: '123456',
      newPassword: 'Abcdef1!',
    })
    expect(limpiarSesionLocal).toHaveBeenCalledOnce()
  })

  it('no limpia la sesión ni llama a la API si la validación local falla', async () => {
    const http = crearHttp()
    const limpiarSesionLocal = vi.fn()
    const service = crearRecoveryService({ http, limpiarSesionLocal })
    await expect(service.confirmar({ ...datos, codigo: '12' })).rejects.toThrow()
    await expect(service.confirmar({ ...datos, nuevaContrasena: 'corta', confirmacion: 'corta' })).rejects.toThrow()
    expect(http.post).not.toHaveBeenCalled()
    expect(limpiarSesionLocal).not.toHaveBeenCalled()
  })

  it.each([
    ['OTP_INVALIDO', CodigoErrorRecuperacion.OTP_INVALIDO],
    ['OTP_EXPIRADO', CodigoErrorRecuperacion.OTP_EXPIRADO],
    ['OTP_AGOTADO', CodigoErrorRecuperacion.OTP_AGOTADO],
  ])('mapea %s y no limpia la sesión', async (code, esperado) => {
    const http = crearHttp(vi.fn().mockRejectedValue(rechazo(400, { code })))
    const limpiarSesionLocal = vi.fn()
    const error = await crearRecoveryService({ http, limpiarSesionLocal }).confirmar(datos).catch((e) => e)
    expect(error.detalle.codigo).toBe(esperado)
    expect(limpiarSesionLocal).not.toHaveBeenCalled()
  })
})

describe('recoveryService.apelar', () => {
  const datos = { email: 'ana@mail.com', password: 'secreto', mensaje: 'Creo que fue un error en mi cuenta.' }

  it('envía la apelación según el contrato', async () => {
    const http = crearHttp()
    await crearRecoveryService({ http, limpiarSesionLocal: vi.fn() }).apelar(datos)
    expect(http.post).toHaveBeenCalledWith('/auth/appeals', datos)
  })

  it('valida mensaje y contraseña antes de enviar', async () => {
    const http = crearHttp()
    const service = crearRecoveryService({ http, limpiarSesionLocal: vi.fn() })
    await expect(service.apelar({ ...datos, mensaje: 'corto' })).rejects.toThrow()
    await expect(service.apelar({ ...datos, password: '' })).rejects.toThrow()
    expect(http.post).not.toHaveBeenCalled()
  })

  it.each([
    [401, {}, CodigoErrorRecuperacion.CREDENCIALES_INVALIDAS],
    [403, { code: 'CUENTA_NO_APELABLE' }, CodigoErrorRecuperacion.CUENTA_NO_APELABLE],
    [409, { code: 'APELACION_DUPLICADA' }, CodigoErrorRecuperacion.APELACION_DUPLICADA],
    [429, { code: 'APELACION_RECHAZO_RECIENTE' }, CodigoErrorRecuperacion.APELACION_RECHAZO_RECIENTE],
  ])('mapea %i', async (status, body, esperado) => {
    const http = crearHttp(vi.fn().mockRejectedValue(rechazo(status, body)))
    const error = await crearRecoveryService({ http, limpiarSesionLocal: vi.fn() }).apelar(datos).catch((e) => e)
    expect(error.detalle.codigo).toBe(esperado)
  })
})

describe('appealsAdminService', () => {
  it('lista con filtro y paginación 0-based', async () => {
    const http = crearHttp()
    await crearAppealsAdminService(http).listar({ estado: EstadoApelacion.PENDIENTE, page: 2 })
    expect(http.get).toHaveBeenCalledWith('/admin/apelaciones', {
      params: { estado: 'PENDIENTE', page: 2, size: 20 },
    })
  })

  it('acepta y rechaza con los endpoints del contrato', async () => {
    const http = crearHttp()
    const service = crearAppealsAdminService(http)
    await service.aceptar('a1')
    expect(http.post).toHaveBeenCalledWith('/admin/apelaciones/a1/aceptar')
    await service.rechazar('a2', '  Reincidencia ')
    expect(http.post).toHaveBeenCalledWith('/admin/apelaciones/a2/rechazar', { motivo: 'Reincidencia' })
  })

  it('exige motivo para rechazar', () => {
    const http = crearHttp()
    expect(() => crearAppealsAdminService(http).rechazar('a2', '   ')).toThrow()
    expect(http.post).not.toHaveBeenCalled()
  })
})
