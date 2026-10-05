/**
 * Test de servicio `UsuariosServiceAdmin.banear()` y `UsuariosServiceAdmin.eliminar()` con cliente
 * HTTP simulado (mock), sin backend real.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T033, depende de T031, T032)
 * - Union/specs/002-frontend-admin/spec.md RF-01, RF-02, RF-03, CB-01, CB-08
 *
 * Nota de colisión de nombres (mismo patrón documentado en T012/T014/T015/T020/T022/T030/T031/T032):
 * ya existe `Union/frontend/src/services/UsuariosService.ts` (clase `UsuariosService`, de
 * `001-plataforma-unificada`, T065), con tests en `tests/services/UsuariosService.test.ts` (T076).
 * Ese servicio usa `apiEndpoints`/`httpClientAdmin` (rutas con prefijo `/admin/...`) y NO valida
 * fecha de baneo temporal (CB-08 no estaba en el alcance de `001-plataforma-unificada`). El
 * servicio de ESTE módulo (`002-frontend-admin`) usa el puerto `HttpClient` abstracto (T031) y
 * `apiEndpointsAdmin` (T032, rutas sin prefijo `/admin`), e incorpora la validación de CB-08. Por
 * lo tanto, el servicio bajo test se llama `UsuariosServiceAdmin` y este archivo de test
 * `UsuariosServiceAdmin.test.ts`, para no romper ni duplicar el servicio/tests existentes.
 *
 * Este test está escrito ANTES de la implementación (TDD, Principio VIII): debe fallar en este
 * momento porque `src/application/UsuariosServiceAdmin.ts` aún no existe (se crea en T034a–T034c).
 *
 * Cobertura:
 * - `banear()`: invoca `HttpClient.post` en la ruta de `apiEndpointsAdmin.banearUsuario()` cuando
 *   `usuario.puedeSerBaneado()` es true (delegado a la entidad `UsuarioAdmin`, T017).
 * - `banear()`: rechaza sin invocar el `HttpClient` cuando `usuario.puedeSerBaneado()` es false
 *   (CB-01, usuario ADMIN o uno mismo).
 * - `banear()` con fecha de baneo temporal pasada/inválida (CB-08): rechaza ANTES de invocar el
 *   `HttpClient`, con un mensaje de validación claro.
 * - `eliminar()`: invoca `HttpClient.delete` en la ruta de `apiEndpointsAdmin.eliminarUsuario()`
 *   cuando `usuario.puedeSerEliminado()` es true.
 * - `eliminar()`: rechaza sin invocar el `HttpClient` cuando `usuario.puedeSerEliminado()` es false
 *   (CB-01).
 */

import { describe, it, expect, vi } from 'vitest'
import { UsuariosServiceAdmin } from '../../src/application/UsuariosServiceAdmin'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../../src/infrastructure/apiEndpointsAdmin'
import { UsuarioAdmin } from '../../src/domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../../src/domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

function crearUsuarioComun(id = 'usr-comun-1'): UsuarioAdmin {
  return new UsuarioAdmin({
    id,
    nombre: 'Juan Común',
    mail: 'juan@user.com',
    rol: RolUsuario.USER,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  })
}

function crearUsuarioAdmin(id = 'admin-otro-2'): UsuarioAdmin {
  return new UsuarioAdmin({
    id,
    nombre: 'Laura Admin',
    mail: 'laura@admin.com',
    rol: RolUsuario.ADMIN,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  })
}

describe('UsuariosServiceAdmin (T033)', () => {
  describe('banear()', () => {
    it('invoca HttpClient.post en la ruta de apiEndpointsAdmin.banearUsuario() cuando el usuario puede ser baneado', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuario = crearUsuarioComun('usr-1')

      await servicio.banear(usuario)

      expect(httpClient.post).toHaveBeenCalledWith(
        apiEndpointsAdmin.banearUsuario('usr-1'),
        undefined
      )
    })

    it('rechaza sin invocar HttpClient cuando el usuario objetivo tiene rol ADMIN (CB-01)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuarioAdmin = crearUsuarioAdmin('admin-1')

      await expect(servicio.banear(usuarioAdmin)).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('rechaza sin invocar HttpClient cuando el usuario objetivo es el propio administrador (CB-01)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient, () => 'admin-propio-1')
      const usuarioAdmin = crearUsuarioAdmin('admin-propio-1')

      await expect(servicio.banear(usuarioAdmin)).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('rechaza una fecha de fin de baneo temporal en el pasado sin invocar HttpClient (CB-08)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuario = crearUsuarioComun('usr-2')
      const fechaFinPasada = new Date('2000-01-01T00:00:00.000Z')

      await expect(
        servicio.banear(usuario, { fechaFin: fechaFinPasada })
      ).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('acepta una fecha de fin de baneo temporal futura e invoca HttpClient.post con la fecha', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuario = crearUsuarioComun('usr-3')
      const fechaFinFutura = new Date(Date.now() + 1000 * 60 * 60 * 24)

      await servicio.banear(usuario, { fechaFin: fechaFinFutura })

      expect(httpClient.post).toHaveBeenCalledWith(
        apiEndpointsAdmin.banearUsuario('usr-3'),
        { fechaFin: fechaFinFutura.toISOString() }
      )
    })
  })

  describe('eliminar()', () => {
    it('invoca HttpClient.delete en la ruta de apiEndpointsAdmin.eliminarUsuario() cuando el usuario puede ser eliminado', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuario = crearUsuarioComun('usr-4')

      await servicio.eliminar(usuario)

      expect(httpClient.delete).toHaveBeenCalledWith(apiEndpointsAdmin.eliminarUsuario('usr-4'))
    })

    it('rechaza sin invocar HttpClient cuando el usuario objetivo tiene rol ADMIN (CB-01)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient)
      const usuarioAdmin = crearUsuarioAdmin('admin-2')

      await expect(servicio.eliminar(usuarioAdmin)).rejects.toThrow()
      expect(httpClient.delete).not.toHaveBeenCalled()
    })

    it('rechaza sin invocar HttpClient cuando el usuario objetivo es el propio administrador (CB-01)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new UsuariosServiceAdmin(httpClient, () => 'admin-propio-2')
      const usuarioAdmin = crearUsuarioAdmin('admin-propio-2')

      await expect(servicio.eliminar(usuarioAdmin)).rejects.toThrow()
      expect(httpClient.delete).not.toHaveBeenCalled()
    })
  })
})
