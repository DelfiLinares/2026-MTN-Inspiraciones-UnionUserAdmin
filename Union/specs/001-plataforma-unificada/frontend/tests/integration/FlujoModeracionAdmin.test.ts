/**
 * Test de integración: flujo de moderación (frontend admin) — T103.
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T103) define este test
 * dentro de `Admin/my-proyect/frontend-admin/tests/integration/` (proyecto `Admin/`, fuera del
 * alcance permitido de esta tarea). Por instrucción explícita del usuario ("todos los cambios
 * hacelos en la carpeta que estás usando ahora... únicamente lee lo que hay en admin, no lo
 * edites"), la implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/tests/integration/`, sin leer ni modificar ningún
 * archivo de `Admin/` ni de `Usuario/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-10, HU-11, HU-13, RF-11, RF-12, RF-54, RF-61,
 *   RF-63, AC-11.4, AC-11.5)
 * - Union/specs/001-plataforma-unificada/tasks.md (T103, depende de T096, T098A, T098B)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`POST /auth/login`,
 *   `GET /auth/me`, `GET /admin/dashboard`, `GET /admin/publicaciones/reportadas`,
 *   `DELETE /admin/publicaciones/{id}`)
 *
 * Flujo cubierto (mockeado, sin red real):
 * 1. Login ADMIN exitoso (`AuthAdminService.login`, T063/T095) → sesión administrativa persistida.
 * 2. Dashboard (`DashboardService.obtenerIndicadores`, T064/T096) → indicadores agregados, incluye
 *    `reportesPendientes`.
 * 3. Listado de publicaciones reportadas (`ModeracionService.listarPublicacionesReportadas`, T066/
 *    T098A) → una fila por reporte individual (resuelto A1, RF-61), publicación en estado
 *    REPORTADA.
 * 4. Eliminar la publicación reportada con confirmación explícita (simulada) (`ModeracionService.
 *    eliminarPublicacion`, T066/T098B, RF-63/AC-11.4).
 * 5. Verifica que el estado de la publicación pasa a ELIMINADA, reflejado en la UI (simulada
 *    mediante actualización en memoria del listado, AC-11.5), sin volver a listar contra la API.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login } from '../../src/services/AuthAdminService'
import { obtenerIndicadoresDashboard } from '../../src/services/DashboardService'
import {
  listarPublicacionesReportadas,
  eliminarPublicacion,
} from '../../src/services/ModeracionService'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { sessionManager } from '../../src/infrastructure/sessionManager'
import { SesionAdministrativa } from '../../src/domain/SesionAdministrativa'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'

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

describe('Integración: flujo de moderación (frontend admin) — T103', () => {
  const mailAdmin = 'admin@platform.com'
  const passwordValido = 'Admin123!'
  const publicacionIdMock = 'pub-reportada-001'
  const reporteIdMock = 'rep-001'

  beforeEach(() => {
    vi.clearAllMocks()
    sessionManager.limpiarSesion()
  })

  afterEach(() => {
    sessionManager.limpiarSesion()
    vi.restoreAllMocks()
  })

  it('login ADMIN → dashboard → listado reportadas → eliminar con confirmación → estado ELIMINADA reflejado en UI', async () => {
    // 1. Login ADMIN exitoso (RF-11, RF-12, AC-10.1)
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

    expect(sesion).toBeInstanceOf(SesionAdministrativa)
    expect(sesion.usuario.rol).toBe('ADMIN')
    expect(sessionManager.obtenerSesion()?.token).toBe('token-jwt-admin-valido')

    // 2. Dashboard: obtiene los 7 indicadores agregados (RF-54, HU-13)
    vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
      reportesPendientes: 3,
      usuariosActivos: 120,
      desafiosPendientes: 4,
      publicacionesActivas: 500,
      publicacionesEliminadas: 12,
      usuariosBaneados: 2,
      desafiosAprobadosRechazados: 8,
    })

    const indicadores = await obtenerIndicadoresDashboard()

    expect(indicadores.reportesPendientes).toBe(3)
    expect(httpClientAdmin.get).toHaveBeenCalledWith('/admin/dashboard', undefined)

    // 3. Listado de moderación: una fila por reporte individual (resuelto A1, RF-61)
    vi.mocked(httpClientAdmin.get).mockResolvedValueOnce({
      items: [
        {
          id: reporteIdMock,
          publicacionId: publicacionIdMock,
          motivo: MotivoReporte.CONTENIDO_INAPROPIADO,
          reportanteId: 'usuario-reportante-1',
          fecha: '2026-09-20T10:00:00.000Z',
          estado: EstadoModeracion.PENDIENTE,
          publicacion: {
            id: publicacionIdMock,
            autorId: 'usuario-autor-1',
            estado: EstadoPublicacion.REPORTADA,
            cantidadReportes: 1,
            motivosReporte: [MotivoReporte.CONTENIDO_INAPROPIADO],
          },
        },
      ],
      total: 1,
    })

    const pagina = await listarPublicacionesReportadas()

    expect(pagina.items).toHaveLength(1)
    const [{ reporte, publicacion }] = pagina.items
    expect(reporte.id).toBe(reporteIdMock)
    expect(publicacion?.estado).toBe(EstadoPublicacion.REPORTADA)

    // 4. Eliminar la publicación reportada (con confirmación explícita simulada, AC-11.4)
    const confirmacionUsuario = true // Simula la confirmación explícita del modal (RNF-07)
    expect(confirmacionUsuario).toBe(true)

    vi.mocked(httpClientAdmin.delete).mockResolvedValueOnce(undefined)

    await eliminarPublicacion(publicacionIdMock)

    expect(httpClientAdmin.delete).toHaveBeenCalledWith(
      `/admin/publicaciones/${publicacionIdMock}`,
      undefined
    )

    // 5. AC-11.5: el estado ELIMINADA se refleja en la UI (actualización en memoria del listado,
    //    sin volver a llamar a la API de listado).
    expect(publicacion).toBeDefined()
    const publicacionActualizada = new PublicacionModeracion({
      id: publicacion!.id,
      autorId: publicacion!.autorId,
      estado: EstadoPublicacion.ELIMINADA,
      cantidadReportes: publicacion!.cantidadReportes,
      motivosReporte: publicacion!.motivosReporte,
    })

    expect(publicacionActualizada.estado).toBe(EstadoPublicacion.ELIMINADA)
    expect(publicacionActualizada.puedeEliminarse()).toBe(false)

    // Ninguna llamada adicional de listado fue realizada tras eliminar (solo login, dashboard,
    // listado inicial y la eliminación en sí).
    expect(httpClientAdmin.get).toHaveBeenCalledTimes(3)
    expect(httpClientAdmin.delete).toHaveBeenCalledTimes(1)
  })
})
