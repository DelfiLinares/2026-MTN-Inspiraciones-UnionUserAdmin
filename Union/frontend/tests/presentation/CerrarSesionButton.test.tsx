import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CerrarSesionButton } from '../../src/presentation/shared/CerrarSesionButton'

const cerrarSesion = vi.hoisted(() => vi.fn())

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => ({ cerrarSesion }),
}))

describe('CerrarSesionButton', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('cierra la sesión y vuelve al login', async () => {
    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/privado" element={<CerrarSesionButton />} />
          <Route path="/login" element={<span>Inicio de sesión</span>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByText('Inicio de sesión')).toBeInTheDocument()
    expect(cerrarSesion).toHaveBeenCalledOnce()
  })
})