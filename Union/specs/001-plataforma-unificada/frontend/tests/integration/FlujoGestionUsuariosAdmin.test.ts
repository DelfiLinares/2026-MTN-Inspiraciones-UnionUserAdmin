/**
 * Test de integración: flujo de gestión de usuarios (frontend admin) — T104.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-56 a RF-59, RF-76, CB-11, CB-12,
 *   AC-12.5, AC-12.6, AC-12.8)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T104, depende de T097A, T097B)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/usuarios`, `POST /admin/usuarios/{id}/banear`,
 *   `POST /admin/usuarios/{id}/degradar`)
 *
 * Nota de ubicación: la ruta canónica de esta tarea en tasks.md es
 * `Admin/my-proyect/frontend-admin/tests/integration/`, carpeta fuera del alcance permitido
 * de este trabajo (no se debe tocar `Admin/` ni `Usuario/`). Por instrucción expresa del
 * usuario (misma autorización aplicada en T095 y generalizada en T102), el test equivalente
 * se implementa dentro de `Union/.../frontend/tests/integration/`, reutilizando
 * `UsuariosService` y la entidad `UsuarioAdmin` ya implementadas en T097A/T097B. No se leyó
 * ni modificó ningún archivo de `Admin/` ni `Usuario/` para esta tarea.
 *
 * Flujo cubierto:
 * 1. Buscar usuario (`buscarUsuarios`) → obtiene resultados paginados.
 * 2. Intentar banear a un ADMIN → bloqueado sin invocar la API (CB-11, AC-12.5).
 * 3. Banear a un USER (con confirmación simulada) → refleja `estadoCuenta` actualizado (RF-57).
 * 4. Degradar a otro ADMIN → refleja `rol` actualizado a USER (RF-76, AC-12.8).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buscarUsuarios,
  banearUsuario,
  degradarUsuario,
  AccionAccesoAdminProhibidaError,
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

describe('Integración: flujo de gestión de usuarios (frontend admin) — T104', () => {
  const adminActualId = 'admin-propio-1'

  const usuarioAdminAjenoDto = {
    id: 'admin-otro-2',
    nombre: 'Laura Admin',
    mail: 'laura@admin.com',
    rol: RolUsuario.ADMIN,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  }

  const usuarioComunDto = {
    id: 'usr-comun-1',
    nombre: 'Juan Común',
    mail: 'juan@user.com',
    rol: RolUsuario.USER,
    estadoCuenta: EstadoCuentaUsuario.ACTIVO,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it(
    'buscar usuario → intentar banear a un ADMIN (bloqueado) → banear a un USER ' +
      '(con confirmación) → reflejo de estadoCuenta; incluye degradar a otro ADMIN (RF-76)',
    async () => {
      // 1. Buscar usuario: GET /admin/usuarios
      vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
        items: [usuarioAdminAjenoDto, usuarioComunDto],
        total: 2,
      })

      const pagina = await buscarUsuarios({ q: 'a' })

      expect(pagina.total).toBe(2)
      expect(pagina.items).toHaveLength(2)

      const usuarioAdminAjeno = pagina.items.find((u) => u.id === usuarioAdminAjenoDto.id)
      const usuarioComun = pagina.items.find((u) => u.id === usuarioComunDto.id)
      expect(usuarioAdminAjeno).toBeInstanceOf(UsuarioAdmin)
      expect(usuarioComun).toBeInstanceOf(UsuarioAdmin)
      expect(usuarioAdminAjeno!.rol).toBe(RolUsuario.ADMIN)
      expect(usuarioComun!.rol).toBe(RolUsuario.USER)

      // 2. Intentar banear a un ADMIN → bloqueado sin invocar la API (CB-11, AC-12.5)
      expect(usuarioAdminAjeno!.puedeSerBaneado(adminActualId)).toBe(false)
      await expect(banearUsuario(usuarioAdminAjeno!, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()

      // 3. Banear a un USER (con confirmación simulada) → refleja estadoCuenta actualizado (RF-57)
      const confirmacionBaneo = true // simula confirmación explícita del administrador en la UI
      expect(usuarioComun!.puedeSerBaneado(adminActualId)).toBe(true)

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        ...usuarioComunDto,
        estadoCuenta: EstadoCuentaUsuario.BANEADO,
      })

      let usuarioBaneado: UsuarioAdmin | undefined
      if (confirmacionBaneo) {
        usuarioBaneado = await banearUsuario(usuarioComun!, adminActualId)
      }

      expect(httpClientAdmin.post).toHaveBeenCalledTimes(1)
      expect(usuarioBaneado).toBeInstanceOf(UsuarioAdmin)
      expect(usuarioBaneado!.estadoCuenta).toBe(EstadoCuentaUsuario.BANEADO)
      expect(usuarioBaneado!.puedeSerBaneado(adminActualId)).toBe(false)

      // 4. Degradar a otro ADMIN → refleja rol actualizado a USER (RF-76, AC-12.8)
      expect(usuarioAdminAjeno!.puedeSerDegradado(adminActualId)).toBe(true)

      vi.mocked(httpClientAdmin.post).mockResolvedValueOnce({
        ...usuarioAdminAjenoDto,
        rol: RolUsuario.USER,
      })

      const usuarioDegradado = await degradarUsuario(usuarioAdminAjeno!, adminActualId)

      expect(httpClientAdmin.post).toHaveBeenCalledTimes(2)
      expect(usuarioDegradado).toBeInstanceOf(UsuarioAdmin)
      expect(usuarioDegradado.rol).toBe(RolUsuario.USER)
      expect(usuarioDegradado.puedeSerDegradado(adminActualId)).toBe(false)

      // Verificación de conteos totales de llamadas a la API
      expect(httpClientAdmin.get).toHaveBeenCalledTimes(1)
      expect(httpClientAdmin.post).toHaveBeenCalledTimes(2)
      expect(httpClientAdmin.delete).not.toHaveBeenCalled()
    }
  )

  it(
    'un administrador no puede degradarse a sí mismo (AC-12.8)',
    async () => {
      const propioAdmin = new UsuarioAdmin({
        id: adminActualId,
        nombre: 'Carlos Admin',
        mail: 'carlos@admin.com',
        rol: RolUsuario.ADMIN,
        estadoCuenta: EstadoCuentaUsuario.ACTIVO,
      })

      expect(propioAdmin.puedeSerDegradado(adminActualId)).toBe(false)
      await expect(degradarUsuario(propioAdmin, adminActualId)).rejects.toThrow(
        AccionAccesoAdminProhibidaError
      )
      expect(httpClientAdmin.post).not.toHaveBeenCalled()
    }
  )
})
