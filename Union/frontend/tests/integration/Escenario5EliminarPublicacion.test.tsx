/**
 * Validación del Escenario 5 de `quickstart.md` (HU-05 — Eliminar una publicación) — T078.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T078, depende de T046, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 5
 * - Union/specs/002-frontend-admin/spec.md RF-22, RF-23, AC-05.3
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles,
 * usando los fixtures de T073 (`tests/fixtures/publicaciones.fixtures.ts`).
 *
 * Pasos cubiertos (numeración de quickstart.md → Escenario 5):
 * 1. En Gestión de Publicaciones, seleccionar una publicación en estado `REPORTADA`
 *    (`PUBLICACION_REPORTADA_FIXTURE`).
 * 2. La acción "Eliminar" está visualmente diferenciada como sensible (RF-22).
 * 3. Iniciar "Eliminar" y confirmar explícitamente (RF-23).
 * 4. El estado de la publicación pasa a ELIMINADA (AC-05.3) — verificado vía la llamada al
 *    servicio y el refresco del listado (recargar), reflejando el cambio sin bloquear la interfaz.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { PublicacionesPage } from '../../src/presentation/publicaciones/PublicacionesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { PUBLICACION_REPORTADA_FIXTURE } from '../fixtures/publicaciones.fixtures'

function crearHttpClientMock(publicaciones: unknown[]): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: publicaciones, total: publicaciones.length }),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

describe('Escenario 5 de quickstart.md — Eliminar una publicación (T078)', () => {
  it('pasos 1-4: elimina una publicación REPORTADA tras confirmar explícitamente (AC-05.3)', async () => {
    const httpClient = crearHttpClientMock([PUBLICACION_REPORTADA_FIXTURE])

    // Paso 1: en Gestión de Publicaciones, la publicación REPORTADA aparece en el listado.
    render(<PublicacionesPage httpClient={httpClient} />)

    await waitFor(() =>
      expect(screen.getByText(PUBLICACION_REPORTADA_FIXTURE.id)).toBeInTheDocument()
    )

    const botonEliminar = screen.getByRole('button', { name: 'Eliminar' })

    // Paso 2: la acción "Eliminar" está visualmente diferenciada como sensible (RF-22).
    expect(botonEliminar.className).toContain('accion-sensible-boton--sensible')
    expect(botonEliminar).not.toBeDisabled()

    // Paso 3: iniciar "Eliminar" y confirmar explícitamente (RF-23).
    fireEvent.click(botonEliminar)
    const botonConfirmar = await screen.findByRole('button', { name: 'Confirmar' })
    fireEvent.click(botonConfirmar)

    // Paso 4 (resultado esperado, AC-05.3): se invoca la eliminación y el listado se recarga,
    // reflejando el cambio sin bloquear la interfaz.
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
