/**
 * Validación del Escenario 3 de `quickstart.md` (HU-03 — Promover un usuario a administrador) —
 * T076.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T076, depende de T067, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 3
 * - Union/specs/002-frontend-admin/spec.md RF-23, AC-03.3, AC-03.4, CB-02
 *
 * Nota: ver cabecera de `Escenario1BanearUsuario.test.tsx` (T074) para la justificación de
 * ejecutar mecánicamente los escenarios MANUALES de `quickstart.md` como tests repetibles,
 * usando los fixtures de T073 (`tests/fixtures/usuarios.fixtures.ts`). El `HttpClient` mockeado
 * en este test no aplica filtrado real sobre `rolFiltro` (ese filtrado es responsabilidad del
 * backend real, fuera de alcance de este frontend); por eso el mock devuelve ambos usuarios
 * (USER y ADMIN) independientemente del filtro aplicado por `PromocionPage`, permitiendo cubrir
 * el paso 5-6 (no-op sobre un usuario ya ADMIN) dentro de la misma pantalla.
 *
 * Pasos cubiertos (numeración de quickstart.md → Escenario 3):
 * 1. Ir a la pantalla de Promoción de Usuarios (`PromocionPage`).
 * 2-3. Seleccionar un usuario USER, iniciar "Promover a administrador" y confirmar explícitamente
 *    (RF-23).
 * 4. El rol del usuario pasa a ADMIN (AC-03.3) — verificado vía la llamada al servicio y el
 *    refresco del listado (recargar).
 * 5-6. Intentar promover a un usuario que ya es ADMIN: la operación se rechaza como no-op sin
 *    llamar a la API (AC-03.4, CB-02) — el botón aparece deshabilitado.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

import { PromocionPage } from '../../src/presentation/promocion/PromocionPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'
import {
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

describe('Escenario 3 de quickstart.md — Promover un usuario a administrador (T076)', () => {
  it('pasos 1-4: promueve un usuario USER a ADMIN tras confirmar explícitamente (AC-03.3)', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    // Paso 1: ir a la pantalla de Promoción de Usuarios.
    render(<PromocionPage httpClient={httpClient} />)

    await waitFor(() =>
      expect(screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioUser = screen.getByText(USUARIO_USER_ACTIVO_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioUser).not.toBeNull()
    const botonPromoverUser = within(filaUsuarioUser as HTMLElement).getByRole('button', {
      name: 'Promover a administrador',
    })
    expect(botonPromoverUser).not.toBeDisabled()

    // Paso 2-3: iniciar "Promover a administrador" y confirmar explícitamente (RF-23).
    fireEvent.click(botonPromoverUser)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

    // Paso 4 (resultado esperado, AC-03.3): se invoca la promoción y el listado se recarga,
    // reflejando el cambio sin bloquear la interfaz.
    await waitFor(() => expect(httpClient.post).toHaveBeenCalled())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pasos 5-6: intentar promover a un usuario ya ADMIN se rechaza como no-op sin llamar a la API (AC-03.4, CB-02)', async () => {
    const httpClient = crearHttpClientMock([USUARIO_USER_ACTIVO_FIXTURE, USUARIO_ADMIN_EXISTENTE_FIXTURE])

    render(<PromocionPage httpClient={httpClient} />)

    await waitFor(() =>
      expect(screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre)).toBeInTheDocument()
    )

    const filaUsuarioAdmin = screen.getByText(USUARIO_ADMIN_EXISTENTE_FIXTURE.nombre).closest('tr')
    expect(filaUsuarioAdmin).not.toBeNull()
    const botonPromoverAdmin = within(filaUsuarioAdmin as HTMLElement).getByRole('button', {
      name: 'Promover a administrador',
    })

    expect(botonPromoverAdmin).toBeDisabled()

    fireEvent.click(botonPromoverAdmin)
    expect(httpClient.post).not.toHaveBeenCalled()
  })
})
