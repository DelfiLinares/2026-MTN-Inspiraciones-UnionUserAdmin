import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  authService,
  CuentaBloqueadaError,
  MENSAJE_CUENTA_BANEADA,
  MENSAJE_CUENTA_ELIMINADA,
} from '../../src/services/authService'
import { mailPasswordProvider } from '../../src/infrastructure/authProviders/mailPasswordProvider'
import { tokenStorage, verificarSesion } from '../../src/infrastructure/tokenStorage'
import { httpClient, ApiError, HttpForbiddenError } from '../../src/infrastructure/httpClient'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

vi.mock('../../src/infrastructure/authProviders/mailPasswordProvider', () => ({
  mailPasswordProvider: {
    iniciarSesion: vi.fn(),
  },
}))

vi.mock('../../src/infrastructure/tokenStorage', () => ({
  tokenStorage: {
    setToken: vi.fn(),
    clearToken: vi.fn(),
    getToken: vi.fn(),
    obtenerUsuarioPersistido: vi.fn().mockReturnValue(null),
  },
  verificarSesion: vi.fn(),
}))

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClient: {
      post: vi.fn(),
      get: vi.fn(),
    },
  }
})

describe('authService & AuthContext (T069)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('inicia sesión exitosamente cuando las credenciales son válidas (RF-13)', async () => {
      const mockUsuario = new Usuario({
        id: 'u1',
        nombre: 'Ana',
        apellido: 'Pérez',
        rol: RolUsuario.USER,
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 5,
      })

      const mockResult = {
        token: 'token-valido-123',
        usuario: mockUsuario,
      }

      vi.mocked(mailPasswordProvider.iniciarSesion).mockResolvedValueOnce(mockResult)

      const res = await authService.login({ email: 'ana@ejemplo.com', password: 'password123' })

      expect(mailPasswordProvider.iniciarSesion).toHaveBeenCalledWith({
        email: 'ana@ejemplo.com',
        password: 'password123',
      })
      expect(res).toEqual(mockResult)
    })

    it('rechaza el login con CuentaBloqueadaError y mensaje específico cuando la cuenta está BANEADA (RF-77, AC-04.9)', async () => {
      const apiError = new ApiError('Acceso denegado', 403, { error: 'CUENTA_BANEADA' })
      vi.mocked(mailPasswordProvider.iniciarSesion).mockRejectedValueOnce(apiError)

      await expect(
        authService.login({ email: 'baneado@ejemplo.com', password: 'password123' })
      ).rejects.toThrow(CuentaBloqueadaError)

      try {
        await authService.login({ email: 'baneado@ejemplo.com', password: 'password123' })
      } catch (err) {
        if (err instanceof CuentaBloqueadaError) {
          expect(err.codigo).toBe('CUENTA_BANEADA')
          expect(err.message).toBe(MENSAJE_CUENTA_BANEADA)
        }
      }

      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })

    it('rechaza el login con CuentaBloqueadaError y mensaje específico cuando la cuenta está ELIMINADA (RF-77, AC-04.9)', async () => {
      const forbiddenError = new HttpForbiddenError({ error: 'CUENTA_ELIMINADA' })
      vi.mocked(mailPasswordProvider.iniciarSesion).mockRejectedValueOnce(forbiddenError)

      await expect(
        authService.login({ email: 'eliminado@ejemplo.com', password: 'password123' })
      ).rejects.toThrow(CuentaBloqueadaError)

      try {
        await authService.login({ email: 'eliminado@ejemplo.com', password: 'password123' })
      } catch (err) {
        if (err instanceof CuentaBloqueadaError) {
          expect(err.codigo).toBe('CUENTA_ELIMINADA')
          expect(err.message).toBe(MENSAJE_CUENTA_ELIMINADA)
        }
      }

      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })

    it('propaga otros errores inesperados sin capturarlos como cuenta bloqueada', async () => {
      const errorRed = new Error('Error de conexión')
      vi.mocked(mailPasswordProvider.iniciarSesion).mockRejectedValueOnce(errorRed)

      await expect(
        authService.login({ email: 'usuario@ejemplo.com', password: 'password123' })
      ).rejects.toThrow('Error de conexión')
    })
  })

  describe('verificarSesionActual', () => {
    it('retorna la entidad Usuario si la sesión es válida (GET /auth/me)', async () => {
      const mockUsuario = new Usuario({
        id: 'u1',
        nombre: 'Ana',
        apellido: 'Pérez',
        rol: RolUsuario.USER,
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 10,
      })

      vi.mocked(verificarSesion).mockResolvedValueOnce(mockUsuario)

      const usuarioActual = await authService.verificarSesionActual()

      expect(verificarSesion).toHaveBeenCalled()
      expect(usuarioActual).toBe(mockUsuario)
    })

    it('retorna null si la sesión expiró o es inválida (CB-06)', async () => {
      vi.mocked(verificarSesion).mockResolvedValueOnce(null)
      vi.mocked(tokenStorage.obtenerUsuarioPersistido).mockReturnValueOnce(null)

      const usuarioActual = await authService.verificarSesionActual()

      expect(usuarioActual).toBeNull()
    })

    it('restaura el usuario persistido cuando falla la verificación remota y el token sigue guardado', async () => {
      const usuarioPersistido = new Usuario({
        id: 'u1',
        nombre: 'Ana',
        apellido: 'Pérez',
        rol: RolUsuario.USER,
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 0,
      })
      vi.mocked(verificarSesion).mockRejectedValueOnce(new ApiError('Error interno', 500, null))
      vi.mocked(tokenStorage.obtenerUsuarioPersistido).mockReturnValueOnce(usuarioPersistido)

      await expect(authService.verificarSesionActual()).resolves.toBe(usuarioPersistido)
    })
  })

  describe('logout', () => {
    it('invoca el endpoint de logout y limpia el token local', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({})

      await authService.logout()

      expect(httpClient.post).toHaveBeenCalledWith('/auth/logout')
      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })

    it('limpia el token local de todas formas aunque la petición de red falle', async () => {
      vi.mocked(httpClient.post).mockRejectedValueOnce(new Error('Fallo de red'))

      await authService.logout()

      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })
  })

  describe('registrar', () => {
    it('registra con el contrato del API y luego inicia sesión para obtener el token', async () => {
      const mockResult = {
        token: 'token-nuevo-123',
        usuario: new Usuario({
          id: 'u2',
          nombre: 'Carlos',
          apellido: 'Gómez',
          rol: RolUsuario.USER,
          siguiendoAlUsuarioActual: false,
          cantidadSeguidores: 0,
        }),
      }

      vi.mocked(httpClient.post).mockResolvedValueOnce({
        id: 'u2',
        email: 'carlos@ejemplo.com',
        username: 'carlosg',
        nombreCompleto: 'Carlos Gómez',
        role: 'USER',
        status: 'ACTIVE',
      })
      vi.mocked(mailPasswordProvider.iniciarSesion).mockResolvedValueOnce(mockResult)

      const res = await authService.registrar({
        nombre: 'Carlos',
        apellido: 'Gómez',
        username: 'carlosg',
        email: 'carlos@ejemplo.com',
        password: 'password123',
      })

      expect(httpClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'carlos@ejemplo.com',
        username: 'carlosg',
        password: 'password123',
        nombreCompleto: 'Carlos Gómez',
      })
      expect(mailPasswordProvider.iniciarSesion).toHaveBeenCalledWith({
        email: 'carlos@ejemplo.com',
        password: 'password123',
      })
      expect(res).toEqual(mockResult)
      expect(res.usuario).toBeInstanceOf(Usuario)
      expect(res.usuario.nombre).toBe('Carlos')
    })
  })
})
