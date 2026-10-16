/**
 * Test de `interpretarEstadoHttpAdmin` / `HttpSesionInvalidaOSinPermisosError`: manejo uniforme de
 * respuestas 401/403 del futuro backend administrativo.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T072, depende de T031)
 * - Union/specs/002-frontend-admin/spec.md RNF-05
 *
 * Nota de ubicación: RNF-09 exige que los tests de este módulo vivan en `tests/domain`,
 * `tests/application`, `tests/presentation` o `tests/integration` (ver `vitest.config.ts`, T005).
 * Esta utilidad pertenece a la capa de infraestructura (`src/infrastructure/`), sin una carpeta de
 * test dedicada entre esas 4; se ubica en `tests/integration/` por ser la más afín a la
 * verificación de manejo de respuestas HTTP (frontera de integración con el backend).
 *
 * Cobertura:
 * - Un estado 401 (no autenticado/sesión expirada) lanza `HttpSesionInvalidaOSinPermisosError` con
 *   el mensaje uniforme "Sesión no válida o sin permisos.".
 * - Un estado 403 (sin permisos) lanza el mismo error con el mismo mensaje uniforme (RNF-05: el
 *   frontend no distingue el motivo exacto).
 * - Cualquier otro estado (200, 404, 500, etc.) no lanza ningún error: no es responsabilidad de
 *   esta utilidad manejar otros códigos.
 */

import { describe, it, expect } from 'vitest'
import {
  interpretarEstadoHttpAdmin,
  HttpSesionInvalidaOSinPermisosError,
  MENSAJE_SESION_INVALIDA_O_SIN_PERMISOS,
} from '../../src/infrastructure/AdminHttpClientPort'

describe('interpretarEstadoHttpAdmin (T072)', () => {
  it('lanza HttpSesionInvalidaOSinPermisosError con mensaje uniforme ante un 401', () => {
    expect(() => interpretarEstadoHttpAdmin(401, { detalle: 'token expirado' })).toThrow(
      HttpSesionInvalidaOSinPermisosError
    )

    try {
      interpretarEstadoHttpAdmin(401, { detalle: 'token expirado' })
      expect.fail('Se esperaba que interpretarEstadoHttpAdmin lanzara un error para el estado 401.')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpSesionInvalidaOSinPermisosError)
      expect((error as Error).message).toBe(MENSAJE_SESION_INVALIDA_O_SIN_PERMISOS)
      expect((error as HttpSesionInvalidaOSinPermisosError).status).toBe(401)
    }
  })

  it('lanza HttpSesionInvalidaOSinPermisosError con el mismo mensaje uniforme ante un 403', () => {
    try {
      interpretarEstadoHttpAdmin(403, { detalle: 'rol insuficiente' })
      expect.fail('Se esperaba que interpretarEstadoHttpAdmin lanzara un error para el estado 403.')
    } catch (error) {
      expect(error).toBeInstanceOf(HttpSesionInvalidaOSinPermisosError)
      // RNF-05: el mensaje es idéntico al del caso 401; el frontend no distingue el motivo exacto.
      expect((error as Error).message).toBe(MENSAJE_SESION_INVALIDA_O_SIN_PERMISOS)
      expect((error as HttpSesionInvalidaOSinPermisosError).status).toBe(403)
    }
  })

  it('no lanza ningún error para estados distintos de 401/403 (200, 404, 500)', () => {
    expect(() => interpretarEstadoHttpAdmin(200)).not.toThrow()
    expect(() => interpretarEstadoHttpAdmin(404)).not.toThrow()
    expect(() => interpretarEstadoHttpAdmin(500)).not.toThrow()
  })
})
