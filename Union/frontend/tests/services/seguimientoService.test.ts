import { beforeEach, describe, expect, it, vi } from 'vitest'
import { seguimientoService } from '../../src/services/seguimientoService'
import { ApiError, httpClient } from '../../src/infrastructure/httpClient'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../../src/infrastructure/httpClient')>()
  return {
    ...original,
    httpClient: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('seguimientoService API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('obtiene el estado desde el perfil público', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      id: 'user-2',
      username: 'luz',
      cantidadSeguidores: 4,
      siguiendoPorUsuarioActual: true,
    })

    const resultado = await seguimientoService.obtenerEstadoSeguimiento(
      'user-1',
      'user-2',
    )

    expect(httpClient.get).toHaveBeenCalledWith('/usuarios/user-2')
    expect(resultado).toMatchObject({
      usuarioId: 'user-1',
      usuarioASeguidoId: 'user-2',
      siguiendo: true,
    })
  })

  it('sigue mediante PUT /usuarios/{id}/seguimiento', async () => {
    vi.mocked(httpClient.put).mockResolvedValueOnce(undefined)

    const resultado = await seguimientoService.toggleSeguimiento(
      'user-1',
      'user-2',
      true,
    )

    expect(httpClient.put).toHaveBeenCalledWith('/usuarios/user-2/seguimiento')
    expect(httpClient.delete).not.toHaveBeenCalled()
    expect(resultado).toMatchObject({
      usuarioId: 'user-1',
      usuarioASeguidoId: 'user-2',
      ahora_siguiendo: true,
    })
    expect(resultado.timestamp).toBeInstanceOf(Date)
  })

  it('deja de seguir mediante DELETE /usuarios/{id}/seguimiento', async () => {
    vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

    const resultado = await seguimientoService.toggleSeguimiento(
      'user-1',
      'user-2',
      false,
    )

    expect(httpClient.delete).toHaveBeenCalledWith('/usuarios/user-2/seguimiento')
    expect(httpClient.put).not.toHaveBeenCalled()
    expect(resultado.ahora_siguiendo).toBe(false)
  })

  it('no permite seguir al mismo usuario', async () => {
    await expect(
      seguimientoService.toggleSeguimiento('user-1', 'user-1', true),
    ).rejects.toThrow('No se puede seguir a sí mismo')

    expect(httpClient.put).not.toHaveBeenCalled()
    expect(httpClient.delete).not.toHaveBeenCalled()
  })

  it('adapta errores del API sin perder status ni request id', async () => {
    vi.mocked(httpClient.put).mockRejectedValueOnce(
      new ApiError('Forbidden', 403, {
        code: 'FORBIDDEN',
        message: 'Not allowed.',
        requestId: 'req-2',
      }),
    )

    await expect(
      seguimientoService.toggleSeguimiento('user-1', 'user-2', true),
    ).rejects.toMatchObject({
      name: 'ErrorDeDominio',
      status: 403,
      codigo: 'FORBIDDEN',
      requestId: 'req-2',
    })
  })
})
