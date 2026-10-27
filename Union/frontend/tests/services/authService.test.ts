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
      delete: vi.fn(),
    },
  }
})

function crearUsuario(
  id: string,
  _username: string,
  nombreCompleto: string,
  cantidadSeguidores = 0,
): Usuario {
  const [nombre, ...apellidos] = nombreCompleto.split(/\s+/)
  return new Usuario({
    id,
    nombre,
    apellido: apellidos.join(' '),
    rol: RolUsuario.USER,
    siguiendoAlUsuarioActual: false,
    cantidadSeguidores,
  })
}

describe('authService & AuthContext (T069)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('inicia sesión exitosamente cuando las credenciales son válidas (RF-13)', async () => {
      const mockUsuario = crearUsuario('u1', 'ana', 'Ana Pérez', 5)

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

      const intentoLogin = authService.login({
        email: 'baneado@ejemplo.com',
        password: 'password123',
      })

      await expect(intentoLogin).rejects.toBeInstanceOf(CuentaBloqueadaError)
      await expect(intentoLogin).rejects.toMatchObject({
        codigo: 'CUENTA_BANEADA',
        message: MENSAJE_CUENTA_BANEADA,
      })

      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })

    it('rechaza el login con CuentaBloqueadaError y mensaje específico cuando la cuenta está ELIMINADA (RF-77, AC-04.9)', async () => {
      const forbiddenError = new HttpForbiddenError({ error: 'CUENTA_ELIMINADA' })
      vi.mocked(mailPasswordProvider.iniciarSesion).mockRejectedValueOnce(forbiddenError)

      const intentoLogin = authService.login({
        email: 'eliminado@ejemplo.com',
        password: 'password123',
      })

      await expect(intentoLogin).rejects.toBeInstanceOf(CuentaBloqueadaError)
      await expect(intentoLogin).rejects.toMatchObject({
        codigo: 'CUENTA_ELIMINADA',
        message: MENSAJE_CUENTA_ELIMINADA,
      })

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
      const mockUsuario = crearUsuario('u1', 'ana', 'Ana Pérez', 10)

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

    it('propaga errores remotos y conserva el token para reintentar', async () => {
      const errorRemoto = new ApiError('Error interno', 500, null)
      vi.mocked(verificarSesion).mockRejectedValueOnce(errorRemoto)
      vi.mocked(tokenStorage.getToken).mockReturnValue('jwt-persistente')

      await expect(authService.verificarSesionActual()).rejects.toBe(errorRemoto)

      expect(tokenStorage.getToken()).toBe('jwt-persistente')
      expect(tokenStorage.clearToken).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('limpia la sesión local sin llamar a un endpoint inexistente', async () => {
      await authService.logout()

      expect(httpClient.post).not.toHaveBeenCalled()
      expect(tokenStorage.clearToken).toHaveBeenCalled()
    })

    it('permite cerrar sesión más de una vez sin depender de la red', async () => {
      await authService.logout()
      await authService.logout()

      expect(httpClient.post).not.toHaveBeenCalled()
      expect(tokenStorage.clearToken).toHaveBeenCalledTimes(2)
    })
  })

  describe('registrar', () => {
    it('registra con el contrato del API y luego inicia sesión para obtener el token', async () => {
      const mockResult = {
        token: 'token-nuevo-123',
        usuario: crearUsuario('u2', 'carlosg', 'Carlos Gómez'),
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
      expect(res.usuario.apellido).toBe('Gómez')
    })

    it('indica que la cuenta ya se creó si falla el inicio de sesión automático', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({})
      vi.mocked(mailPasswordProvider.iniciarSesion).mockRejectedValueOnce(
        new ApiError('Error HTTP 401 al solicitar /auth/login', 401, {
          code: 'UNAUTHORIZED',
          message: 'Credenciales inválidas',
        }),
      )

      await expect(
        authService.registrar({
          nombre: 'Ana',
          apellido: 'Test',
          username: 'ana',
          email: 'ana@test.com',
          password: 'Passw0rd!123',
        }),
      ).rejects.toThrow(
        'La cuenta se creó, pero no se pudo iniciar sesión automáticamente. Iniciá sesión con tus credenciales.',
      )
    })
  })
})
