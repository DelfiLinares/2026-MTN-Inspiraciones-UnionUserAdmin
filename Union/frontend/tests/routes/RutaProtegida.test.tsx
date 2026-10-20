import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from '../../src/routes/RutaProtegida'

const authMocks = vi.hoisted(() => ({
  state: {
    usuario: null as { rol: string; onboardingCompletado?: boolean } | null,
    cargando: false,
    estaAutenticado: true,
  },
}))

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => authMocks.state,
}))

vi.mock('../../src/services/authService', () => ({
  authService: { logout: vi.fn() },
}))

describe('RutaProtegida onboarding', () => {
  afterEach(() => {
    cleanup()
  })

  it('redirige al cuestionario a un usuario que todavía no lo completó', async () => {
    authMocks.state = {
      usuario: { rol: 'USER', onboardingCompletado: false },
      cargando: false,
      estaAutenticado: true,
    }

    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Routes>
          <Route path="/feed" element={<RutaProtegida><span>Feed</span></RutaProtegida>} />
          <Route path="/cuestionario" element={<RutaProtegida><span>Cuestionario</span></RutaProtegida>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cuestionario')).toBeInTheDocument()
    expect(screen.queryByText('Feed')).not.toBeInTheDocument()
  })

})