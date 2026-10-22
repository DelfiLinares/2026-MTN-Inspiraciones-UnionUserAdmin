import { afterEach, describe, expect, it, vi } from 'vitest'
import { httpClientAdmin, setAuthToken } from '../../src/infrastructure/httpClientAdmin'
import { opcionesListadoAdmin, respuestaListadoAdmin } from '../../src/infrastructure/adaptadorListadosAdmin'

afterEach(() => { vi.unstubAllGlobals(); setAuthToken(null) })

describe('Listados administrativos — contrato real de la API', () => {
  it('traduce búsqueda y página antes de pedir usuarios y recupera contenido y totalElementos', async () => {
    const fila = { id: 'u1', nombre: 'Ana', email: 'ana@example.test', rol: 'USER', estadoCuenta: 'ACTIVO' }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ contenido: [fila], totalElementos: 23, pagina: 1 }), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken('token-de-prueba')
    const resultado = await httpClientAdmin.get<{ items: typeof fila[]; total: number }>('/admin/usuarios', { params: { q: 'ana', page: 2, pageSize: 10 } })
    const url = new URL(fetchMock.mock.calls[0][0], 'http://localhost')
    expect(url.searchParams.get('texto')).toBe('ana')
    expect(url.searchParams.get('pagina')).toBe('1')
    expect(url.searchParams.get('tamanio')).toBe('10')
    expect(url.searchParams.has('q')).toBe(false)
    expect(resultado.items).toEqual([fila])
    expect(resultado.total).toBe(23)
  })
  it('no cambia el contrato de reportes ni las respuestas históricas', () => {
    const opciones = { params: { pagina: 0, tamanio: 10 } }
    expect(opcionesListadoAdmin('/admin/reportes', opciones)).toBe(opciones)
    const pagina = { items: [{ id: 'u1' }], total: 1 }
    expect(respuestaListadoAdmin('/admin/usuarios', pagina)).toBe(pagina)
  })
  it('adapta publicaciones y conserva su filtro de estado', () => {
    expect(opcionesListadoAdmin('/admin/publicaciones', { params: { page: 1, pageSize: 10, estado: 'ACTIVA' } })?.params).toEqual({ pagina: 0, tamanio: 10, estado: 'ACTIVA' })
    expect(respuestaListadoAdmin('/admin/publicaciones', { contenido: [], totalElementos: 0 })).toMatchObject({ items: [], total: 0 })
  })
})
