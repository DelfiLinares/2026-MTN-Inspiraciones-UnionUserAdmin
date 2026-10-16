/**
 * Validación del Escenario 2 de `quickstart.md` (HU-02 — Eliminar la cuenta de un usuario) — T075.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T075, depende de T038, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 2
 * - Union/specs/002-frontend-admin/spec.md RF-23, AC-02.3, AC-02.4, CB-01
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles,
 * usando los fixtures de T073 (`tests/fixtures/usuarios.fixtures.ts`).
 *
 * Pasos cubiertos (numeración de quickstart.md → Escenario 2):
 * 1. Listado muestra un usuario con rol `USER` (`USUARIO_USER_ACTIVO_FIXTURE`).
 * 2. Se inicia "Eliminar" y se confirma explícitamente (RF-23).
 * 3. El estado de cuenta pasa a ELIMINADO en la interfaz (AC-02.3) — verificado vía la llamada
 *    al servicio y el refresco del listado (recargar).
 * 4-5. Repetido sobre el usuario ADMIN (`USUARIO_ADMIN_EXISTENTE_FIXTURE`): el botón "Eliminar"
 *    aparece deshabilitado (AC-02.4, CB-01).
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

describe('Escenario 2 de quickstart.md — Eliminar la cuenta de un usuario (T075)', () => {
  it('pasos 1-3: elimina un usuario USER tras confirmar explícitamente (AC-02.3)', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    render(
      <UsuariosPage httpClient={httpClient} obtenerAdminActualId={() => ADMIN_ACTOR_FIXTURE.id} />
    )

    // Paso 1: en Gestión de Usuarios, el usuario con rol USER aparece en el listado.
    await waitFor(() =>
      expect(screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioUser = screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioUser).not.toBeNull()
    const botonEliminarUser = within(filaUsuarioUser as HTMLElement).getByRole('button', {
      name: 'Eliminar',
    })
    expect(botonEliminarUser).not.toBeDisabled()

    // Paso 2: iniciar "Eliminar" y confirmar explícitamente (RF-23).
    fireEvent.click(botonEliminarUser)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    // Paso 3 (resultado esperado, AC-02.3): se invoca la eliminación y el listado se recarga,
    // reflejando el cambio sin bloquear la interfaz.
    await waitFor(() => expect(httpClient.delete).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pasos 4-5: repetido sobre un usuario ADMIN, la acción "Eliminar" aparece deshabilitada (AC-02.4, CB-01)', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    render(
      <UsuariosPage httpClient={httpClient} obtenerAdminActualId={() => ADMIN_ACTOR_FIXTURE.id} />
    )

    await waitFor(() =>
      expect(screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioAdmin = screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioAdmin).not.toBeNull()
    const botonEliminarAdmin = within(filaUsuarioAdmin as HTMLElement).getByRole('button', {
      name: 'Eliminar',
    })

    expect(botonEliminarAdmin).toBeDisabled()

    fireEvent.click(botonEliminarAdmin)
    expect(httpClient.delete).not.toHaveBeenCalled()
  })
})
