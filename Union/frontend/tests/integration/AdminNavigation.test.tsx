import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRouterAdmin } from '../../src/presentation/AppRouterAdmin'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
import { validarAccesoAdmin } from '../../src/infrastructure/sessionGuard'

vi.mock('../../src/infrastructure/sessionGuard', async (original) => ({
  ...await original<typeof import('../../src/infrastructure/sessionGuard')>(), validarAccesoAdmin: vi.fn(),
}))
vi.mock('../../src/infrastructure/sessionManager', async (original) => ({
  ...await original<typeof import('../../src/infrastructure/sessionManager')>(),
  obtenerSesion: () => ({ usuario: { id: 'admin-actual', nombre: 'Administración', rol: 'ADMIN' } }),
}))
vi.mock('../../src/infrastructure/httpClientAdmin', async (original) => ({
  ...await original<typeof import('../../src/infrastructure/httpClientAdmin')>(),
  httpClientAdmin: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

function montar(ruta = '/admin/dashboard') { render(<MemoryRouter initialEntries={[ruta]}><AppRouterAdmin /></MemoryRouter>) }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(validarAccesoAdmin).mockResolvedValue({ id: 'admin-actual' } as never)
  vi.mocked(httpClientAdmin.get).mockImplementation(async <T,>(ruta: string): Promise<T> => {
    const datos: Record<string, unknown> = {
      '/admin/dashboard': { reportesPendientes: 0, usuariosActivos: 8, publicacionesActivas: 29, publicacionesEliminadas: 0, usuariosBaneados: 0 },
      '/admin/usuarios': { items: [{ id: 'u1', nombre: 'Ana de prueba', mail: 'ana@example.test', rol: 'USER', estadoCuenta: 'ACTIVO' }], total: 1 },
      '/admin/reportes': { contenido: [], totalElementos: 0 },
      '/admin/publicaciones': { items: [], total: 0 },
      '/admin/desafios-propuestos': { items: [], total: 0 },
      '/admin/desafios-propuestos/p1': { id: 'p1', autorId: 'u1', titulo: 'Idea de prueba', estado: 'PENDIENTE', contenidoFormulario: { nombre: 'Dibujo de prueba', descripcion: 'Una consigna de ejemplo.' } },
      '/admin/analiticas': { totalReportes: 0 },
      '/desafios': { items: [] }, '/solicitudes': { items: [] }, '/ambitos': [],
    }
    if (!(ruta in datos)) throw new Error('No encontrado')
    return datos[ruta] as T
  })
})
afterEach(() => { vi.restoreAllMocks() })

describe('Navegación administrativa integrada', () => {
  it('permite recorrer Resumen, Usuarios y Moderación desde el mismo encabezado', async () => {
    montar()
    expect(await screen.findByRole('heading', { name: 'Resumen de la comunidad' })).toBeInTheDocument()
    const nav = within(screen.getByRole('navigation', { name: 'Navegación administrativa' }))
    fireEvent.click(nav.getByRole('link', { name: 'Usuarios', exact: true }))
    expect(await screen.findByText('Ana de prueba')).toBeInTheDocument()
    fireEvent.click(nav.getByRole('link', { name: 'Moderación', exact: true }))
    expect(await screen.findByRole('heading', { name: 'No hay reportes' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: 'Moderación' })).toHaveAttribute('aria-current', 'page')
  })

  it.each([
    ['/admin/publicaciones', 'Publicaciones'], ['/admin/promocion', 'Accesos de administración'],
    ['/admin/desafios', 'Gestionar Desafíos'], ['/admin/desafios/nuevo', 'Publicar Desafío'],
    ['/admin/desafios/propuestas', 'Desafíos propuestos'], ['/admin/solicitudes', 'Bandeja de Solicitudes'],
    ['/admin/reportes', 'Reportes y analíticas'], ['/admin/reportes/gestion', 'Gestión de reportes'],
  ])('abre %s dentro del marco protegido', async (ruta, titulo) => {
    montar(ruta)
    expect(await screen.findByRole('heading', { name: titulo, exact: true })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación administrativa' })).toBeInTheDocument()
    expect(validarAccesoAdmin).toHaveBeenCalled()
  })

  it('mantiene el error de un detalle y ofrece volver sin abandonar el admin', async () => {
    montar('/admin/moderacion/reporte-inexistente')
    expect(await screen.findByRole('heading', { name: 'Error al cargar el detalle' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Volver al listado/ }))
    expect(await screen.findByRole('heading', { name: 'Moderación de publicaciones' })).toBeInTheDocument()
  })

  it('muestra una recuperación para una ruta administrativa inexistente', async () => {
    montar('/admin/no-existe')
    expect(await screen.findByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Volver al resumen' }))
    expect(await screen.findByRole('heading', { name: 'Resumen de la comunidad' })).toBeInTheDocument()
  })

  it('abre el detalle de una propuesta por URL y vuelve al listado', async () => {
    montar('/admin/desafios/propuestas/p1')
    expect(await screen.findByText('Dibujo de prueba')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Detalle del desafío propuesto' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Volver al listado/ }))
    expect(await screen.findByRole('heading', { name: 'Desafíos propuestos', exact: true })).toBeInTheDocument()
  })

  it('rechaza entrar sin sesión en rutas nuevas', async () => {
    vi.mocked(validarAccesoAdmin).mockRejectedValue(new Error('Sesión no válida'))
    montar('/admin/desafios/nuevo')
    expect(await screen.findByRole('heading', { name: 'Ingreso al módulo administrativo' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Publicar Desafío' })).not.toBeInTheDocument()
  })
})
