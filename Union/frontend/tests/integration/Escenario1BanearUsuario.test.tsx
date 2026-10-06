/**
 * Validación del Escenario 1 de `quickstart.md` (HU-01 — Banear a un usuario) — T074.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T074, depende de T038, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 1
 * - Union/specs/002-frontend-admin/spec.md RF-22, RF-23, AC-01.4, AC-01.5, CB-01
 *
 * Nota: `quickstart.md` describe un flujo de validación MANUAL. Para dejar un registro
 * verificable y repetible de su ejecución (en ausencia de backend real, conforme a
 * `research.md` §2), este test ejecuta mecánicamente los mismos pasos descritos en el
 * Escenario 1 contra `UsuariosPage` real, usando los fixtures de T073
 * (`tests/fixtures/usuarios.fixtures.ts`) y un `HttpClient` simulado. El resultado de esta
 * ejecución se resume en `frontend-admin/docs/validacion-manual.md` (T074).
 *
 * Pasos cubiertos (numeración de quickstart.md → Escenario 1):
 * 1-2. Listado muestra al usuario USER/ACTIVO (`USUARIO_USER_ACTIVO_FIXTURE`).
 * 3. El botón "Banear" de ese usuario está visualmente diferenciado como sensible (RF-22).
 * 4-5. Se inicia "Banear", se elige baneo temporal con fecha futura, se confirma explícitamente.
 * 6. El estado de cuenta pasa a BANEADO en la interfaz (AC-01.4) — verificado vía la llamada al
 *    servicio con el cuerpo esperado y el refresco del listado (recargar).
 * 7-8. Repetido sobre el usuario ADMIN (`USUARIO_ADMIN_EXISTENTE_FIXTURE`): el botón "Banear"
 *    aparece deshabilitado (AC-01.5, CB-01).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

import { UsuariosPage } from '../../src/presentation/usuarios/UsuariosPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import {
  ADMIN_ACTOR_FIXTURE,
  USUARIO_USER_ACTIVO_FIXTURE,
  USUARIO_ADMIN_EXISTENTE_FIXTURE,
} from '../fixtures/usuarios.fixtures'

function crearHttpClientMock(usuarios: unknown[]): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: usuarios, total: usuarios.length }),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

describe('Escenario 1 de quickstart.md — Banear a un usuario (T074)', () => {
  it('pasos 1-6: banea un usuario USER/ACTIVO con baneo temporal y fecha futura, tras confirmar explícitamente', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    render(
      <UsuariosPage httpClient={httpClient} obtenerAdminActualId={() => ADMIN_ACTOR_FIXTURE.id} />
    )

    // Pasos 1-2: la pantalla de Gestión de Usuarios muestra al usuario USER/ACTIVO.
    await waitFor(() =>
      expect(screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioUser = screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioUser).not.toBeNull()
    const botonBanearUser = within(filaUsuarioUser as HTMLElement).getByRole('button', {
      name: 'Banear',
    })

    // Paso 3: la acción "Banear" está visualmente diferenciada como sensible (RF-22).
    expect(botonBanearUser.className).toContain('accion-sensible-boton--sensible')
    expect(botonBanearUser).not.toBeDisabled()

    // Paso 4: iniciar "Banear", elegir baneo temporal con fecha de fin futura.
    fireEvent.click(botonBanearUser)
    fireEvent.click(screen.getByRole('radio', { name: 'Temporal' }))
    const fechaFutura = '2099-12-31'
    fireEvent.change(screen.getByLabelText('Fecha de fin del baneo temporal'), {
      target: { value: fechaFutura },
    })

    // Paso 5: confirmar explícitamente la acción (RF-23).
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    // Paso 6 (resultado esperado, AC-01.4): la operación se ejecuta con el cuerpo esperado y el
    // listado se recarga reflejando el cambio en la interfaz.
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())
    const [, cuerpoEnviado] = vi.mocked(httpClient.post).mock.calls[0]
    expect(cuerpoEnviado).toMatchObject({ fechaFin: expect.stringContaining('2099-12-31') })
    // El diálogo de confirmación se cierra tras una operación exitosa (interfaz no bloqueada).
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pasos 7-8: repetido sobre un usuario ADMIN, la acción "Banear" aparece deshabilitada (AC-01.5, CB-01)', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    render(
      <UsuariosPage httpClient={httpClient} obtenerAdminActualId={() => ADMIN_ACTOR_FIXTURE.id} />
    )

    await waitFor(() =>
      expect(screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioAdmin = screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioAdmin).not.toBeNull()
    const botonBanearAdmin = within(filaUsuarioAdmin as HTMLElement).getByRole('button', {
      name: 'Banear',
    })

    expect(botonBanearAdmin).toBeDisabled()

    // No debe ser posible iniciar la acción: la interfaz no invoca la API para un ADMIN (CB-01).
    fireEvent.click(botonBanearAdmin)
    expect(httpClient.post).not.toHaveBeenCalled()
  })
})
