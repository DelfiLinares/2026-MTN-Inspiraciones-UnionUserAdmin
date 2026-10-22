import { describe, it, expect, vi } from 'vitest'

const { iniciarSesion } = vi.hoisted(() => ({ iniciarSesion: vi.fn() }))

vi.mock('../../src/infrastructure/authProviders/mailPasswordProvider', () => ({
  mailPasswordProvider: { iniciarSesion },
}))

import { HttpForbiddenError, HttpUnauthorizedError } from '../../src/infrastructure/httpClient'
import { CuentaBloqueadaError, login } from '../../src/services/authService'

describe('authService.login — código del ErrorResponse del backend (spec 008, A-7)', () => {
  it('convierte 403 { code: CUENTA_BANEADA } en CuentaBloqueadaError', async () => {
    iniciarSesion.mockRejectedValue(new HttpForbiddenError({ code: 'CUENTA_BANEADA', message: 'x' }))
    const error = await login({ email: 'a@b.com', password: 'x' }).catch((e) => e)
    expect(error).toBeInstanceOf(CuentaBloqueadaError)
    expect(error.codigo).toBe('CUENTA_BANEADA')
  })

  it('mantiene 401 como error genérico (no revela estado de la cuenta)', async () => {
    iniciarSesion.mockRejectedValue(new HttpUnauthorizedError({ code: 'UNAUTHORIZED' }))
    const error = await login({ email: 'a@b.com', password: 'x' }).catch((e) => e)
    expect(error).not.toBeInstanceOf(CuentaBloqueadaError)
  })
})
