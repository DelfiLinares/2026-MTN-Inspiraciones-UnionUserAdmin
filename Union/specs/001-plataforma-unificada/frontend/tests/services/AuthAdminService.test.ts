/**
 * Tests de `AuthAdminService` y `sessionGuard` (T075).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-75, RF-77, CB-13, AC-10.2)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A, `POST /auth/login`, `GET /auth/me`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T075, depende de T063 y T045)
 *
 * Cobertura:
 * - Rechazo de usuario con rol no-ADMIN al intentar login (AC-10.2, propaga RolNoAutorizadoError y no persiste sesión).
 * - Expiración de sesión cancela acción en curso y borra datos almacenados (CB-13, RF-75).
 * - Excepción por credenciales inválidas (401) y por cuenta bloqueada/baneada/eliminada (403, RF-77).
 * - Flujo exitoso de login con rol ADMIN y guardado de sesión administrativa en `sessionManager`.
 * - Cierre de sesión (`logout`).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  login,
  verificarSesionActual,
  logout,
  CuentaBloqueadaError,
  CredencialesInvalidasError,
} from '../../src/services/AuthAdminService'
import {
  sessionGuard,
  validarAccesoAdmin,
  ejecutarAccionSensible,
  RolNoAutorizadoError,
  SesionExpiradaError,
} from '../../src/infrastructure/sessionGuard'
import {
  httpClientAdmin,
  HttpError,
  HttpForbiddenError,
  HttpUnauthorizedError,
} from '../../src/infrastructure/httpClientAdmin'
import { sessionManager } from '../../src/infrastructure/sessionManager'
import { SesionAdministrativa } from '../../src/domain/SesionAdministrativa'

vi.mock('../../src/infrastructure/httpClientAdmin', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClientAdmin: {
      post: vi.fn(),
      get: vi.fn(),
    },
  }
})

describe('AuthAdminService & sessionGuard (T075)', () => {
  const mailAdmin = 'admin@platform.com'
  const passwordValido = 'Admin123!'

  beforeEach(() => {
    vi.clearAllMocks()
    sessionManager.limpiarSesion()
  })

  afterEach(() => {
    sessionManager.limpiarSesion()
    vi.restoreAllMocks()
  })

  describe('Flujo de Login y Verificación de Rol (AC-10.2, RF-12)', () => {
    it('inicia sesión exitosamente cuando las credenciales son válidas y el usuario es ADMIN', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        token: 'token-jwt-admin-valido',
        usuario: {
          id: 'admin-1',
          nombre: 'Carlos Admin',
          rol: 'ADMIN',
        },
      })

      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        id: 'admin-1',
        nombre: 'Carlos Admin',
        mail: mailAdmin,
        rol: 'ADMIN',
        estadoCuenta: 'ACTIVO',
      })

      const sesion = await login({ mail: mailAdmin, password: passwordValido })

      expect(httpClientAdmin.post).toHaveBeenCalledWith('/auth/login', {
        mail: mailAdmin,
        password: passwordValido,
      })
      expect(httpClientAdmin.get).toHaveBeenCalledWith('/auth/me')

      expect(sesion).toBeInstanceOf(SesionAdministrativa)
      expect(sesion.token).toBe('token-jwt-admin-valido')
      expect(sesion.usuario.rol).toBe('ADMIN')

      // La sesión fue efectivamente guardada en el manager
      expect(sessionManager.obtenerSesion()?.token).toBe('token-jwt-admin-valido')
    })

    it('rechaza el inicio de sesión y no persiste sesión si el rol devuelto por la API no es ADMIN (AC-10.2)', async () => {
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        token: 'token-jwt-user',
        usuario: {
          id: 'user-normal',
          nombre: 'Juan Perez',
          rol: 'USER',
        },
      })

      // GET /auth/me retorna rol USER en vez de ADMIN
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        id: 'user-normal',
        nombre: 'Juan Perez',
        mail: 'user@platform.com',
        rol: 'USER',
      })

      await expect(login({ mail: 'user@platform.com', password: passwordValido })).rejects.toThrow(
        RolNoAutorizadoError
      )

      // La sesión debe haber sido limpiada tras la falla de verificación
      expect(sessionManager.obtenerSesion()).toBeNull()
    })

    it('lanza CredencialesInvalidasError ante un error 401 de la API', async () => {
      vi.mocked(httpClientAdmin.post).mockRejectedValueOnce(
        new HttpError('Unauthorized', 401, { message: 'Credenciales invalidas' })
      )

      await expect(login({ mail: mailAdmin, password: 'wrong' })).rejects.toThrow(
        CredencialesInvalidasError
      )
      expect(sessionManager.obtenerSesion()).toBeNull()
    })

    it('lanza CuentaBloqueadaError con mensaje de baneo cuando la API responde 403 CUENTA_BANEADA (RF-77)', async () => {
      vi.mocked(httpClientAdmin.post).mockRejectedValueOnce(
        new HttpForbiddenError({ error: 'CUENTA_BANEADA' })
      )

      await expect(login({ mail: mailAdmin, password: passwordValido })).rejects.toThrow(
        CuentaBloqueadaError
      )
      await expect(login({ mail: mailAdmin, password: passwordValido })).rejects.toThrow(
        /cuenta ha sido baneada/i
      )
      expect(sessionManager.obtenerSesion()).toBeNull()
    })

    it('lanza CuentaBloqueadaError con mensaje de eliminación cuando la API responde 403 CUENTA_ELIMINADA (RF-77)', async () => {
      vi.mocked(httpClientAdmin.post).mockRejectedValueOnce(
        new HttpForbiddenError({ error: 'CUENTA_ELIMINADA' })
      )

      await expect(login({ mail: mailAdmin, password: passwordValido })).rejects.toThrow(
        /cuenta ha sido eliminada/i
      )
      expect(sessionManager.obtenerSesion()).toBeNull()
    })
  })

  describe('verificarSesionActual & sessionGuard.validarAccesoAdmin', () => {
    it('lanza SesionExpiradaError si no existe una sesión previa guardada', async () => {
      await expect(verificarSesionActual()).rejects.toThrow(SesionExpiradaError)
    })

    it('valida exitosamente la sesión persistida previa consultando GET /auth/me', async () => {
      sessionManager.guardarSesion(
        new SesionAdministrativa({
          usuario: {
            id: 'admin-1',
            nombre: 'Admin',
            mail: mailAdmin,
            rol: 'ADMIN',
            estadoCuenta: 'ACTIVO',
            esAdmin: () => true,
          } as any,
          token: 'token-persistido',
          expiraEn: new Date(Date.now() + 3600000),
        })
      )

      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        id: 'admin-1',
        nombre: 'Admin',
        mail: mailAdmin,
        rol: 'ADMIN',
      })

      const admin = await verificarSesionActual()

      expect(admin.id).toBe('admin-1')
      expect(admin.rol).toBe('ADMIN')
    })
  })

  describe('ejecutarAccionSensible & Expiración de Sesión (CB-13, RF-75)', () => {
    it('ejecuta la acción sensible si la sesión es válida', async () => {
      sessionManager.guardarSesion(
        new SesionAdministrativa({
          usuario: { id: 'admin-1' } as any,
          token: 'token-valido',
          expiraEn: new Date(Date.now() + 3600000),
        })
      )

      const accionMock = vi.fn().mockResolvedValue('resultado-sensible')

      const resultado = await ejecutarAccionSensible(accionMock)

      expect(resultado).toBe('resultado-sensible')
      expect(accionMock).toHaveBeenCalledTimes(1)
    })

    it('CB-13 / RF-75: aborta la acción sensible, limpia la sesión y dispara onSesionExpirada si la sesión expiró localmente', async () => {
      const onExpiradaMock = vi.fn()
      const accionMock = vi.fn()

      // Sesión con fecha de expiración en el pasado
      sessionManager.guardarSesion(
        new SesionAdministrativa({
          usuario: { id: 'admin-1' } as any,
          token: 'token-expirado',
          expiraEn: new Date(Date.now() - 10000),
        })
      )

      await expect(
        ejecutarAccionSensible(accionMock, { onSesionExpirada: onExpiradaMock })
      ).rejects.toThrow(SesionExpiradaError)

      expect(accionMock).not.toHaveBeenCalled()
      expect(sessionManager.obtenerSesion()).toBeNull()
      expect(onExpiradaMock).toHaveBeenCalledWith(
        expect.stringMatching(/sesión expiró/i)
      )
    })

    it('CB-13: limpia la sesión y notifica expiración si la acción sensible recibe un error 401/403 en tiempo de ejecución', async () => {
      const onExpiradaMock = vi.fn()
      sessionManager.guardarSesion(
        new SesionAdministrativa({
          usuario: { id: 'admin-1' } as any,
          token: 'token-revocado',
          expiraEn: new Date(Date.now() + 3600000),
        })
      )

      const accionRechazada = vi.fn().mockRejectedValue(new HttpUnauthorizedError('Token expirado'))

      await expect(
        ejecutarAccionSensible(accionRechazada, { onSesionExpirada: onExpiradaMock })
      ).rejects.toThrow(SesionExpiradaError)

      expect(sessionManager.obtenerSesion()).toBeNull()
      expect(onExpiradaMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('limpia la sesión administrativa del almacenamiento', () => {
      sessionManager.guardarSesion(
        new SesionAdministrativa({
          usuario: { id: 'admin-1' } as any,
          token: 'token-activo',
          expiraEn: new Date(Date.now() + 3600000),
        })
      )

      logout()

      expect(sessionManager.obtenerSesion()).toBeNull()
    })
  })
})
