import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mailPasswordProvider } from '../../src/infrastructure/authProviders/mailPasswordProvider'
import { httpClient } from '../../src/infrastructure/httpClient'
import { tokenStorage } from '../../src/infrastructure/tokenStorage'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

vi.mock('../../src/infrastructure/httpClient', () => ({
  httpClient: { post: vi.fn() },
}))

vi.mock('../../src/infrastructure/tokenStorage', () => ({
  tokenStorage: { setToken: vi.fn(), setLoginData: vi.fn() },
}))

describe('mailPasswordProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adapta el contrato de login del API y guarda el access token', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      accessToken: 'jwt-123',
      tokenType: 'Bearer',
      expiresAt: '2026-09-29T12:00:00Z',
      user: {
        id: 'u1',
        email: 'ana@ejemplo.com',
        username: 'ana',
        nombreCompleto: 'Ana Pérez',
        avatarUrl: 'https://example.com/avatar.png',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })

    const resultado = await mailPasswordProvider.iniciarSesion({
      mail: 'ana@ejemplo.com',
      password: 'ClaveSegura1!',
    })

    expect(httpClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@ejemplo.com',
      password: 'ClaveSegura1!',
    })
    expect(tokenStorage.setToken).toHaveBeenCalledWith('jwt-123')
    expect(tokenStorage.setLoginData).toHaveBeenCalledWith(
      'ana@ejemplo.com',
      'ana',
      expect.objectContaining({ id: 'u1', nombre: 'Ana', apellido: 'Pérez' }),
    )
    expect(resultado.token).toBe('jwt-123')
    expect(resultado.usuario).toBeInstanceOf(Usuario)
    expect(resultado.usuario.nombre).toBe('Ana')
    expect(resultado.usuario.apellido).toBe('Pérez')
    expect(resultado.usuario.fotoUrl).toBe('https://example.com/avatar.png')
    expect(resultado.usuario.rol).toBe(RolUsuario.ADMIN)
  })
})