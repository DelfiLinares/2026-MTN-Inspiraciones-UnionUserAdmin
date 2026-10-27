import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { UserLayout } from '../../src/presentation/shared/UserLayout'

vi.mock('../../src/services/AuthContext', () => ({ useAuth: () => ({ estaAutenticado: true, cerrarSesion: vi.fn() }) }))
vi.mock('../../src/presentation/publicaciones/CrearPublicacionDialog', () => ({
  CrearPublicacionDialog: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div role="dialog" aria-label="Nueva publicación"><button onClick={onSuccess}>Confirmar publicación</button><button onClick={onCancel}>Cancelar</button></div>
  ),
}))

function montar(ruta = '/feed') {
  render(<MemoryRouter initialEntries={[ruta]}><Routes><Route element={<UserLayout />}>
    <Route path="/feed" element={<h1>Obras de la comunidad</h1>} />
    <Route path="/buscar" element={<h1>Descubrir obras</h1>} />
    <Route path="/perfil" element={<h1>Mi obra</h1>} />
    <Route path="/registro" element={<h1>Crear cuenta</h1>} />
    <Route path="/cuestionario" element={<h1>Intereses</h1>} />
  </Route></Routes></MemoryRouter>)
}

beforeEach(() => { vi.spyOn(window, 'scrollTo').mockImplementation(() => {}) })

describe('Navegación Trama', () => {
  it('mantiene cuatro destinos y destaca la ruta activa', () => {
    montar()
    const nav = within(screen.getByRole('navigation', { name: 'Navegación principal' }))
    expect(nav.getAllByRole('link')).toHaveLength(4)
    expect(nav.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    fireEvent.click(nav.getByRole('link', { name: 'Descubrir' }))
    expect(screen.getByRole('heading', { name: 'Descubrir obras' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: 'Descubrir' })).toHaveAttribute('aria-current', 'page')
  })

  it('abre y cancela la publicación sin cambiar de destino', () => {
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Obras de la comunidad' })).toBeInTheDocument()
  })

  it('conserva cerrar sesión en el menú de cuenta para móvil', () => {
    montar()
    const cuenta = screen.getByLabelText('Cuenta')
    expect(cuenta.closest('details')).toBeInTheDocument()
    expect(within(cuenta.closest('details')!).getByRole('button', { name: 'Cerrar sesión', hidden: true })).toBeInTheDocument()
  })

  it('confirma la publicación solo después del éxito del diálogo', () => {
    montar()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar publicación' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mi obra' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Tu publicación se compartió.')
  })

  it.each(['/registro', '/cuestionario'])('no añade navegación al flujo de acceso %s', ruta => {
    montar(ruta)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})