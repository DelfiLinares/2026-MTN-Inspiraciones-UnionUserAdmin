/**
 * Tests de `UsuariosService` y reglas de rol (T076).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-56 a RF-59, RF-76, CB-11, CB-12, AC-12.5, AC-12.6, AC-12.8)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/usuarios`, `POST /admin/usuarios/{id}/banear`, `DELETE /admin/usuarios/{id}`,
 *   `POST /admin/usuarios/{id}/promover`, `POST /admin/usuarios/{id}/degradar`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T076, depende de T065)
 *
 * Cobertura:
 * - Caso crítico: Banear deshabilitado/rechazado sobre un usuario con rol ADMIN o sobre uno mismo (CB-11, AC-12.5).
 * - Caso crítico: Eliminar deshabilitado/rechazado sobre un usuario con rol ADMIN o sobre uno mismo (CB-11, AC-12.5).
 * - Promover a un usuario que ya es ADMIN rechazado como no-op de inmediato sin invocar la API (CB-12, AC-12.6).
 * - Degradar a otro ADMIN invoca `POST /admin/usuarios/{id}/degradar` (RF-76).
 * - Degradar al propio administrador autenticado es rechazado con `AccionAccesoAdminProhibidaError` sin invocar la API (AC-12.8).
 * - Degradar a un usuario que ya es USER actúa como no-op sin invocar la API.
 * - Búsqueda paginada en servidor mediante `GET /admin/usuarios`.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buscarUsuarios,
  banearUsuario,
  eliminarUsuario,
  promoverUsuario,
  degradarUsuario,
  AccionAccesoAdminProhibidaError,
  UsuariosService,
} from '../../src/services/UsuariosService'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { UsuarioAdmin } from '../../src/domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../../src/domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'

vi.mock('../../src/infrastructure/httpClientAdmin', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClientAdmin: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  }
})

function crearUserComun(id = 'usr-comun-1'): UsuarioAdmin {
  return new UsuarioAdmin({
    id,
    nombre: 'Juan Común',
    mail: 'juan@user.com',
    rol: RolUsuario.USER,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  })
}

function crearOtroAdmin(id = 'admin-otro-2'): UsuarioAdmin {
  return new UsuarioAdmin({
    id,
    nombre: 'Laura Admin',
    mail: 'laura@admin.com',
    rol: RolUsuario.ADMIN,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  })
}

function crearPropioAdmin(id = 'admin-propio-1'): UsuarioAdmin {
  return new UsuarioAdmin({
    id,
    nombre: 'Carlos Admin',
    mail: 'carlos@admin.com',
    rol: RolUsuario.ADMIN,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  })
}

describe('UsuariosService & Reglas de Rol (T076)', () => {
  const adminActualId = 'admin-propio-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('buscarUsuarios (GET /admin/usuarios, RF-56)', () => {
    it('realiza la búsqueda paginada y filtrada en servidor mapeando los resultados', async () => {
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        items: [
          {
            id: 'usr-1',
            nombre: 'Ana',
            mail: 'ana@mail.com',
            rol: 'USER',
            estadoCuenta: 'ACTIVO',
          },
        ],
        total: 1,
      })

      const respuesta = await buscarUsuarios({ q: 'ana', page: 1, pageSize: 10 })

      expect(httpClientAdmin.get).toHaveBeenCalledWith('/admin/usuarios', {
        params: {
          q: 'ana',
          page: 1,
          pageSize: 10,
          rol: undefined,
          estadoCuenta: undefined,
        },
      })
      expect(respuesta.items).toHaveLength(1)
      expect(respuesta.items[0]).toBeInstanceOf(UsuarioAdmin)
      expect(respuesta.items[0].nombre).toBe('Ana')
      expect(respuesta.total).toBe(1)
    })
  })

  describe('banearUsuario & CB-11, AC-12.5 (Caso crítico)', () => {
    it('banea exitosamente a un usuario común llamando a POST /admin/usuarios/{id}/banear', async () => {
      const user = crearUserComun('usr-target-1')
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'usr-target-1',
        nombre: 'Juan Común',
        mail: 'juan@user.com',
        rol: 'USER',
        estadoCuenta: 'BANEADO',
      })

      const resultado = await banearUsuario(user, adminActualId)

      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/usuarios/usr-target-1/banear', undefined, undefined)
      expect(resultado.estadoCuenta).toBe(EstadoCuentaUsuario.BANEADO)
    })

    it('caso crítico: rechaza banear a otro usuario con rol ADMIN sin invocar a la API (CB-11, AC-12.5)', async () => {
      const otroAdmin = crearOtroAdmin('admin-otro-2')

      await expect(banearUsuario(otroAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })

    it('caso crítico: rechaza banearse a uno mismo sin invocar a la API (CB-11, AC-12.5)', async () => {
      const propioAdmin = crearPropioAdmin(adminActualId)

      await expect(banearUsuario(propioAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })
  })

  describe('eliminarUsuario & CB-11, AC-12.5 (Caso crítico)', () => {
    it('elimina exitosamente a un usuario común llamando a DELETE /admin/usuarios/{id}', async () => {
      const user = crearUserComun('usr-target-1')
      vi.mocked(httpClientAdmin.delete).mockResolvedValueOnce(undefined)

      await eliminarUsuario(user, adminActualId)

      expect(httpClientAdmin.delete).toHaveBeenCalledWith('/admin/usuarios/usr-target-1', undefined)
    })

    it('caso crítico: rechaza eliminar a otro usuario con rol ADMIN sin invocar a la API (CB-11, AC-12.5)', async () => {
      const otroAdmin = crearOtroAdmin('admin-otro-2')

      await expect(eliminarUsuario(otroAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.delete).not.toHaveBeenCalled()
    })

    it('caso crítico: rechaza eliminarse a uno mismo sin invocar a la API (CB-11, AC-12.5)', async () => {
      const propioAdmin = crearPropioAdmin(adminActualId)

      await expect(eliminarUsuario(propioAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.delete).not.toHaveBeenCalled()
    })
  })

  describe('promoverUsuario & CB-12, AC-12.6', () => {
    it('promueve a un usuario USER a ADMIN llamando a POST /admin/usuarios/{id}/promover', async () => {
      const user = crearUserComun('usr-promover-1')
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'usr-promover-1',
        nombre: 'Juan Común',
        mail: 'juan@user.com',
        rol: 'ADMIN',
        estadoCuenta: 'ACTIVO',
      })

      const resultado = await promoverUsuario(user)

      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/usuarios/usr-promover-1/promover', undefined, undefined)
      expect(resultado.rol).toBe(RolUsuario.ADMIN)
    })

    it('promover a un usuario que YA ES ADMIN actúa como no-op retornado sin invocar la API (CB-12, AC-12.6)', async () => {
      const yaAdmin = crearOtroAdmin('admin-ya-existente')

      const resultado = await promoverUsuario(yaAdmin)

      expect(resultado).toBe(yaAdmin)
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })
  })

  describe('degradarUsuario & RF-76, AC-12.8', () => {
    it('degrada a otro ADMIN a USER llamando a POST /admin/usuarios/{id}/degradar (RF-76)', async () => {
      const otroAdmin = crearOtroAdmin('admin-otro-2')
      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'admin-otro-2',
        nombre: 'Laura Admin',
        mail: 'laura@admin.com',
        rol: 'USER',
        estadoCuenta: 'ACTIVO',
      })

      const resultado = await degradarUsuario(otroAdmin, adminActualId)

      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/usuarios/admin-otro-2/degradar', undefined, undefined)
      expect(resultado.rol).toBe(RolUsuario.USER)
    })

    it('AC-12.8: rechaza degradar al propio administrador autenticado sin invocar a la API', async () => {
      const propioAdmin = crearPropioAdmin(adminActualId)

      await expect(degradarUsuario(propioAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      await expect(degradarUsuario(propioAdmin, adminActualId)).rejects.toThrow(
        /no puede degradarse a sí mismo/i
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })

    it('degradar a un usuario que ya es USER actúa como no-op sin invocar la API', async () => {
      const user = crearUserComun('usr-ya-user')

      const resultado = await degradarUsuario(user, adminActualId)

      expect(resultado).toBe(user)
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    })
  })

  describe('Instancia de clase UsuariosService (interoperabilidad)', () => {
    it('delega las llamadas obteniendo adminActualId del proveedor', async () => {
      const servicio = new UsuariosService(httpClientAdmin, () => adminActualId)
      const user = crearUserComun('usr-inst-1')

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        id: 'usr-inst-1',
        nombre: 'Juan Común',
        mail: 'juan@user.com',
        rol: 'USER',
        estadoCuenta: 'BANEADO',
      })

      await servicio.banear(user)
      expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/usuarios/usr-inst-1/banear', undefined, undefined)

      const propio = crearPropioAdmin(adminActualId)
      await expect(servicio.eliminar(propio)).rejects.toThrow(AccionAccesoAdminProhibidaError)
    })
  })
})
