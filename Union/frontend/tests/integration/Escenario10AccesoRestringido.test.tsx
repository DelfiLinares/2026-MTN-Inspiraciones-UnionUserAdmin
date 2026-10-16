/**
 * Validación del Escenario 10 de `quickstart.md` (HU-10 — acceso restringido) — T081.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T081, depende de T028, T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Escenario 10
 * - Union/specs/002-frontend-admin/spec.md AC-10.1, AC-10.3, RNF-05
 *
 * Observación: `AppRoutesAdmin.tsx` aún NO envuelve sus rutas con `GuardiaRolAdmin`
 * (su cabecera la menciona como "aún no implementada"). Por eso este escenario compone la guardia
 * con las pantallas reales dentro del test, replicando el cableado previsto. Es una verificación
 * de interfaz únicamente: la autorización definitiva depende del backend (AC-10.3, RNF-05).
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { GuardiaRolAdmin } from '../../src/presentation/shared/GuardiaRolAdmin'
import { ReportesPage } from '../../src/presentation/reportes/ReportesPage'
import { RolUsuario } from '../../src/domain/enums/RolUsuarioAdmin'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMock(): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }
}

function renderizar(rol: RolUsuario, ruta: string, httpClient: HttpClient) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/reportes"
          element={
            <GuardiaRolAdmin rolActual={rol}>
              <ReportesPage httpClient={httpClient} />
            </GuardiaRolAdmin>
          }
        />
        <Route
          path="/usuarios"
          element={
            <GuardiaRolAdmin rolActual={rol}>
              <h1>Pantalla de usuarios</h1>
            </GuardiaRolAdmin>
          }
        />
        <Route path="/login-admin" element={<h1>Login administrativo</h1>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Escenario 10 de quickstart.md — Acceso restringido (T081)', () => {
  it('pasos 1-2: con rol USER se rechaza/redirige el acceso a cualquier pantalla administrativa (AC-10.1)', () => {
    for (const ruta of ['/reportes', '/usuarios']) {
      const httpClient = crearHttpClientMock()
      const { unmount } = renderizar(RolUsuario.USER, ruta, httpClient)

      expect(screen.getByText('Login administrativo')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Reportes' })).not.toBeInTheDocument()
      expect(screen.queryByText('Pantalla de usuarios')).not.toBeInTheDocument()
      // La pantalla protegida nunca se monta: no se consulta ningún dato.
      expect(httpClient.get).not.toHaveBeenCalled()
      unmount()
    }
  })

  it('contraste: con rol ADMIN se permite el acceso a las pantallas administrativas', async () => {
    const httpClient = crearHttpClientMock()
    renderizar(RolUsuario.ADMIN, '/reportes', httpClient)

    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
    expect(screen.queryByText('Login administrativo')).not.toBeInTheDocument()
  })
})
