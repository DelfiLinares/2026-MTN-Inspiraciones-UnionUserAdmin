import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '../../src/App'

vi.mock('../../src/services/AuthContext', () => ({ AuthProvider: ({ children }: { children: React.ReactNode }) => children }))
vi.mock('../../src/routes', () => ({ AppRoutes: () => <h1>Experiencia de usuario</h1> }))
vi.mock('../../src/presentation/AppRouterAdmin', () => ({ AppRouterAdmin: () => <h1>Consola administrativa</h1> }))

describe('Selección del árbol de rutas en App', () => {
  it.each(['/admin', '/admin/dashboard', '/admin/usuarios', '/admin/moderacion', '/admin/moderacion/r1', '/admin/desafios', '/admin/desafios/nuevo', '/admin/desafios/d1/editar', '/admin/desafios/propuestas/p1', '/admin/solicitudes/s1', '/admin/reportes/gestion', '/admin/publicaciones', '/admin/promocion', '/login-admin'])('resuelve %s en la consola administrativa', ruta => {
    window.history.replaceState({}, '', ruta)
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Consola administrativa' })).toBeInTheDocument()
  })
  it.each(['/feed', '/perfil', '/desafios', '/login', '/registro'])('conserva %s en la experiencia de usuario', ruta => {
    window.history.replaceState({}, '', ruta)
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Experiencia de usuario' })).toBeInTheDocument()
  })
})
