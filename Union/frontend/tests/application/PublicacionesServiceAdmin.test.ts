/**
 * Test de servicio `PublicacionesServiceAdmin.editar()` y `PublicacionesServiceAdmin.eliminar()`
 * con cliente HTTP simulado (mock), sin backend real.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T041, depende de T040)
 * - Union/specs/002-frontend-admin/spec.md RF-09, RF-10, CB-06
 *
 * Nota de nombrado: este servicio no tiene colisión de nombres preexistente (no existe
 * `PublicacionesService.ts` en `Union/frontend/src/services/` ni en `src/application/`). Aun así,
 * se nombra `PublicacionesServiceAdmin` por consistencia con `UsuariosServiceAdmin` (T034),
 * ambos del mismo módulo `002-frontend-admin`, usando el puerto `HttpClient` (T031,
 * `AdminHttpClientPort.ts`) y `apiEndpointsAdmin` (T032/T040).
 *
 * Este test está escrito ANTES de la implementación (TDD, Principio VIII): debe fallar en este
 * momento porque `src/application/PublicacionesServiceAdmin.ts` aún no existe (se crea en
 * T042a–T042c).
 *
 * Cobertura:
 * - `editar()`: invoca `HttpClient.patch` en la ruta de `apiEndpointsAdmin.publicacion()` cuando
 *   `publicacion.puedeSerEditada()` es true (delegado a la entidad `PublicacionModeracion`, T018).
 * - `editar()`: rechaza sin invocar el `HttpClient` cuando `publicacion.puedeSerEditada()` es false
 *   (publicación ya `ELIMINADA`, RF-09).
 * - `editar()`: si la conexión falla durante la operación, el error se propaga sin modificar nada
 *   localmente (CB-06: no se aplican cambios parciales).
 * - `eliminar()`: invoca `HttpClient.post` en la ruta de `apiEndpointsAdmin.eliminarPublicacion()`
 *   cuando `publicacion.puedeSerEliminada()` es true.
 * - `eliminar()`: rechaza sin invocar el `HttpClient` cuando `publicacion.puedeSerEliminada()` es
 *   false (publicación ya `ELIMINADA`, RF-10).
 */

import { describe, it, expect, vi } from 'vitest'
import { PublicacionesServiceAdmin } from '../../src/application/PublicacionesServiceAdmin'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../../src/infrastructure/apiEndpointsAdmin'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacionAdmin'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

function crearPublicacionActiva(id = 'pub-1'): PublicacionModeracion {
  return new PublicacionModeracion({
    id,
    autorId: 'usr-1',
    estado: EstadoPublicacion.ACTIVA,
    cantidadReportes: 0,
    motivosReporte: [],
  })
}

function crearPublicacionEliminada(id = 'pub-2'): PublicacionModeracion {
  return new PublicacionModeracion({
    id,
    autorId: 'usr-1',
    estado: EstadoPublicacion.ELIMINADA,
    cantidadReportes: 0,
    motivosReporte: [],
  })
}

describe('PublicacionesServiceAdmin (T041)', () => {
  describe('editar()', () => {
    it('invoca HttpClient.patch en la ruta de apiEndpointsAdmin.publicacion() cuando la publicación puede editarse', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new PublicacionesServiceAdmin(httpClient)
      const publicacion = crearPublicacionActiva('pub-10')

      await servicio.editar(publicacion, { contenido: 'Nuevo contenido' })

      expect(httpClient.patch).toHaveBeenCalledWith(apiEndpointsAdmin.publicacion('pub-10'), {
        contenido: 'Nuevo contenido',
      })
    })

    it('rechaza sin invocar HttpClient cuando la publicación ya está ELIMINADA (RF-09)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new PublicacionesServiceAdmin(httpClient)
      const publicacion = crearPublicacionEliminada('pub-11')

      await expect(
        servicio.editar(publicacion, { contenido: 'Nuevo contenido' })
      ).rejects.toThrow()
      expect(httpClient.patch).not.toHaveBeenCalled()
    })

    it('propaga el error sin aplicar cambios parciales cuando la conexión falla (CB-06)', async () => {
      const httpClient = crearHttpClientMock()
      ;(httpClient.patch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Conexión interrumpida'))
      const servicio = new PublicacionesServiceAdmin(httpClient)
      const publicacion = crearPublicacionActiva('pub-12')

      await expect(
        servicio.editar(publicacion, { contenido: 'Nuevo contenido' })
      ).rejects.toThrow('Conexión interrumpida')
    })
  })

  describe('eliminar()', () => {
    it('invoca HttpClient.post en la ruta de apiEndpointsAdmin.eliminarPublicacion() cuando la publicación puede eliminarse', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new PublicacionesServiceAdmin(httpClient)
      const publicacion = crearPublicacionActiva('pub-13')

      await servicio.eliminar(publicacion)

      expect(httpClient.post).toHaveBeenCalledWith(
        apiEndpointsAdmin.eliminarPublicacion('pub-13'),
        undefined
      )
    })

    it('rechaza sin invocar HttpClient cuando la publicación ya está ELIMINADA (RF-10)', async () => {
      const httpClient = crearHttpClientMock()
      const servicio = new PublicacionesServiceAdmin(httpClient)
      const publicacion = crearPublicacionEliminada('pub-14')

      await expect(servicio.eliminar(publicacion)).rejects.toThrow()
      expect(httpClient.post).not.toHaveBeenCalled()
    })
  })
})
