import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SiteLayout } from '../../src/presentation/shared/SiteLayout'

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => ({ estaAutenticado: true }),
}))
vi.mock('../../src/presentation/shared/CerrarSesionButton', () => ({
  CerrarSesionButton: () => <button type="button">Cerrar sesión</button>,
}))
vi.mock('../../src/presentation/publicaciones/CrearPublicacionDialog', () => ({
  CrearPublicacionDialog: ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => (
    <div role="dialog" aria-label="Nueva publicación">
      <button onClick={onCancel}>Cancelar publicación</button>
      <button onClick={onSuccess}>Confirmar publicación de prueba</button>
    </div>
  ),
}))

function Contenido() {
  const { pathname } = useLocation()
  return <main><h1>{pathname}</h1></main>
}

function montar(ruta = '/feed') {
  return render(<MemoryRouter initialEntries={[ruta]}><SiteLayout><Contenido /></SiteLayout></MemoryRouter>)
}

describe('Navegación compartida de Trama', () => {
  it('ofrece cuatro destinos, marca accesible y una acción independiente para publicar', () => {
    montar()
    const nav = within(screen.getByRole('navigation', { name: 'Navegación principal' }))
    expect(nav.getAllByRole('link')).toHaveLength(4)
    expect(nav.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Trama' })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('button', { name: 'Publicar' })).toHaveAttribute('aria-label', 'Publicar')
    expect(screen.getByRole('link', { name: 'Notificaciones' })).toBeInTheDocument()
    fireEvent.click(nav.getByRole('link', { name: 'Desafíos' }))
    expect(nav.getByRole('link', { name: 'Desafíos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: '/desafios' })).toBeInTheDocument()
  })

  it.each(['/login', '/registro', '/recuperar-contrasena', '/apelar-suspension'])('no superpone navegación sobre %s', ruta => {
    montar(ruta)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('conecta Publicar con el diálogo existente y lleva al perfil tras confirmación', () => {
    montar()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar publicación' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar publicación de prueba' }))
    expect(screen.getByRole('heading', { name: '/perfil' })).toBeInTheDocument()
  })
})
