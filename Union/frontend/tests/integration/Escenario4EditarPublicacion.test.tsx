/**
 * Validación del Escenario 4 de `quickstart.md` (HU-04 — Editar una publicación de cualquier
 * usuario) — T077.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T077, depende de T046, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 4
 * - Union/specs/002-frontend-admin/spec.md AC-04.2, AC-04.3, AC-04.4
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles,
 * usando los fixtures de T073 (`tests/fixtures/publicaciones.fixtures.ts`).
 *
 * Pasos cubiertos (numeración de quickstart.md → Escenario 4):
 * 1-2. Ir a Gestión de Publicaciones; abrir una publicación ACTIVA cuyo autor no sea el
 *    administrador autenticado (`PUBLICACION_ACTIVA_FIXTURE`, `autorId` distinto de
 *    `ADMIN_ACTOR_FIXTURE.id`).
 * 3. Editar el contenido y confirmar explícitamente el guardado (AC-04.2).
 * 4. Los cambios se reflejan sin recargar la página (AC-04.3) — verificado vía `onGuardado`
 *    (cierre del formulario) y recarga del listado en el mismo árbol de React (sin navegación).
 * 5-6. Simular un fallo de guardado: se muestra un mensaje de error y el formulario conserva los
 *    datos editados (AC-04.4).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { PublicacionesPage } from '../../src/presentation/publicaciones/PublicacionesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import { ADMIN_ACTOR_FIXTURE } from '../fixtures/usuarios.fixtures'
import { PUBLICACION_ACTIVA_FIXTURE } from '../fixtures/publicaciones.fixtures'

function crearHttpClientMock(publicaciones: unknown[], patchImpl?: () => Promise<unknown>): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: publicaciones, total: publicaciones.length }),
    post: vi.fn().mockResolvedValue({}),
    patch: patchImpl ? vi.fn(patchImpl) : vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

describe('Escenario 4 de quickstart.md — Editar una publicación de cualquier usuario (T077)', () => {
  it('pasos 1-4: edita una publicación ACTIVA de otro autor y los cambios se reflejan sin recargar la página (AC-04.3)', async () => {
    // Paso 2: el autor de la publicación fixture no coincide con el administrador autenticado.
    expect(PUBLICACION_ACTIVA_FIXTURE.autorId).not.toBe(ADMIN_ACTOR_FIXTURE.id)

    const httpClient = crearHttpClientMock([PUBLICACION_ACTIVA_FIXTURE])

    // Paso 1: ir a la pantalla de Gestión de Publicaciones.
    render(<PublicacionesPage httpClient={httpClient} />)

    await waitFor(() =>
      expect(screen.getByText(PUBLICACION_ACTIVA_FIXTURE.id)).toBeInTheDocument()
    )

    // Paso 2 (continuación): abrir el formulario de edición de esa publicación.
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const textarea = screen.getByLabelText('Contenido de la publicación') as HTMLTextAreaElement

    // Paso 3: editar el contenido y confirmar explícitamente el guardado (AC-04.2).
    fireEvent.change(textarea, { target: { value: 'Contenido editado por el administrador' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    // Paso 4 (resultado esperado, AC-04.3): la edición se guarda y el formulario se cierra sin
    // recargar la página (misma sesión de React, sin navegación).
    await waitFor(() => expect(httpClient.patch).toHaveBeenCalled())
    expect(screen.queryByLabelText('Contenido de la publicación')).not.toBeInTheDocument()
  })

  it('pasos 5-6: ante un fallo de guardado, se muestra un mensaje de error y el formulario conserva los datos editados (AC-04.4)', async () => {
    const httpClient = crearHttpClientMock([PUBLICACION_ACTIVA_FIXTURE], () =>
      Promise.reject(new Error('No se pudo guardar la publicación.'))
    )

    render(<PublicacionesPage httpClient={httpClient} />)

    await waitFor(() =>
      expect(screen.getByText(PUBLICACION_ACTIVA_FIXTURE.id)).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const textarea = screen.getByLabelText('Contenido de la publicación') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Contenido editado que no debe perderse' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    // Paso 6 (resultado esperado, AC-04.4): mensaje de error no bloqueante y datos conservados.
    await waitFor(() =>
      expect(screen.getByText('No se pudo guardar la publicación.')).toBeInTheDocument()
    )
    expect(
      (screen.getByLabelText('Contenido de la publicación') as HTMLTextAreaElement).value
    ).toBe('Contenido editado que no debe perderse')
  })
})
