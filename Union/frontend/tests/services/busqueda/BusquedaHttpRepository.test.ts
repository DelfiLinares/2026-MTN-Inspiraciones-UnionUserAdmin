import { describe, expect, it, vi } from 'vitest'
import {
  BusquedaHttpRepository,
  RUTA_BUSQUEDA,
  RUTA_CATALOGO,
  RUTA_FYP,
  type HttpClientBusqueda,
} from '../../../src/infrastructure/busqueda/BusquedaHttpRepository'
import { ApiError, HttpForbiddenError, HttpUnauthorizedError } from '../../../src/infrastructure/httpClient'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'

const paginaDto = {
  items: [
    {
      id: 'p1',
      titulo: 'Obra',
      autor: { id: 'a', nombre: 'Ana' },
      miniaturaUrl: 'https://x/1.jpg',
      tipoContenido: 'IMAGEN',
      estado: 'ACTIVA',
    },
  ],
  cursorSiguiente: 'sig',
}

function clienteFalso(respuesta: unknown = paginaDto) {
  const get = vi.fn(async (ruta: string, _opciones?: { signal?: AbortSignal }) => ruta.startsWith(RUTA_FYP) && respuesta === paginaDto ? {
    items: [{ id: 'p1', contenido: 'Obra', usuarioId: 'a', fotoUrl: 'https://x/1.jpg', tipoContenido: 'IMAGEN', estado: 'ACTIVA' }], nextCursor: 'sig',
  } : respuesta)
  return { get: get as unknown as HttpClientBusqueda['get'], mock: get }
}

function clienteQueFalla(error: unknown) {
  return { get: (async () => { throw error }) as HttpClientBusqueda['get'] }
}

const f = (tipo: TipoFiltro, valor: string) => new FiltroActivo(tipo, valor)

describe('BusquedaHttpRepository — peticiones', () => {
  it('aplica filtros sin texto y conserva los criterios y el cursor al paginar', async () => {
    const { get, mock } = clienteFalso()
    const repo = new BusquedaHttpRepository({ get })
    const criterios = CriteriosBusqueda.vacio().conTexto('a')
      .conFiltro(f(TipoFiltro.ESTILO, 'Realismo'))
      .conFiltro(f(TipoFiltro.TECNICA, 'Grafito'))
    const ctrl = new AbortController()
    await repo.obtenerFyp(undefined, ctrl.signal, criterios)
    await repo.obtenerFyp('20', ctrl.signal, criterios)
    for (const [ruta, opciones] of mock.mock.calls) {
      expect(ruta.startsWith(`${RUTA_BUSQUEDA}?`)).toBe(true)
      const query = new URLSearchParams(ruta.split('?')[1])
      expect(query.get('q')).toBe('')
      expect(query.get('estilo')).toBe('Realismo')
      expect(query.get('tecnica')).toBe('Grafito')
      expect(opciones?.signal).toBe(ctrl.signal)
    }
    expect(new URLSearchParams(mock.mock.calls[1][0].split('?')[1]).get('cursor')).toBe('20')
  })
  it('obtenerFyp: GET /feed/fyp con limite=20 y sin cursor en la primera página', async () => {
    const { get, mock } = clienteFalso()
    const pagina = await new BusquedaHttpRepository({ get }).obtenerFyp()
    expect(mock.mock.calls[0][0]).toBe(`${RUTA_FYP}?limite=20`)
    expect(pagina.items).toHaveLength(1)
    expect(pagina.cursorSiguiente).toBe('sig')
  })

  it('obtenerFyp: envía el cursor recibido', async () => {
    const { get, mock } = clienteFalso()
    await new BusquedaHttpRepository({ get }).obtenerFyp('abc')
    expect(mock.mock.calls[0][0]).toBe(`${RUTA_FYP}?cursor=abc&limite=20`)
  })

  it('buscar: envía q y repite las claves de los filtros múltiples', async () => {
    const { get, mock } = clienteFalso()
    const criterios = CriteriosBusqueda.vacio()
      .conTexto('paisaje')
      .conFiltro(f(TipoFiltro.ESTILO, 'abstracto'))
      .conFiltro(f(TipoFiltro.ESTILO, 'realista'))
      .conFiltro(f(TipoFiltro.TECNICA, 'oleo'))
      .conFiltro(f(TipoFiltro.TIPO_ARTE, 'pintura'))
      .conFiltro(f(TipoFiltro.TIPO_CONTENIDO, 'IMAGEN'))
    await new BusquedaHttpRepository({ get }).buscar(criterios, 'c1')
    const url = mock.mock.calls[0][0] as string
    expect(url.startsWith(`${RUTA_BUSQUEDA}?`)).toBe(true)
    const q = new URLSearchParams(url.split('?')[1])
    expect(q.get('q')).toBe('paisaje')
    expect(q.getAll('estilo')).toEqual(['abstracto', 'realista'])
    expect(q.getAll('tecnica')).toEqual(['oleo'])
    expect(q.getAll('tipoArte')).toEqual(['pintura'])
    expect(q.getAll('tipoContenido')).toEqual(['IMAGEN'])
    expect(q.get('cursor')).toBe('c1')
    expect(q.get('limite')).toBe('20')
  })

  it('buscar: nunca envía distancia (A-02 diferida)', async () => {
    const { get, mock } = clienteFalso()
    const criterios = CriteriosBusqueda.vacio().conTexto('ab')
    await new BusquedaHttpRepository({ get }).buscar(criterios)
    expect(mock.mock.calls[0][0]).not.toContain('distancia')
  })

  it('obtenerCatalogoFiltros: GET /filtros/catalogo y mapea', async () => {
    const { get, mock } = clienteFalso({
      estilos: [{ valor: 'a', etiqueta: 'A' }],
      tecnicas: [],
      tiposArte: [],
    })
    const c = await new BusquedaHttpRepository({ get }).obtenerCatalogoFiltros()
    expect(mock.mock.calls[0][0]).toBe(RUTA_CATALOGO)
    expect(c.estilos).toHaveLength(1)
  })

  it('pasa el AbortSignal al cliente', async () => {
    const { get, mock } = clienteFalso()
    const ctrl = new AbortController()
    await new BusquedaHttpRepository({ get }).obtenerFyp(undefined, ctrl.signal)
    expect(mock.mock.calls[0][1]).toEqual({ signal: ctrl.signal })
  })
})

describe('BusquedaHttpRepository — errores', () => {
  const casos: Array<[string, unknown, TipoErrorBusqueda]> = [
    ['401', new HttpUnauthorizedError(null), TipoErrorBusqueda.NO_AUTENTICADO],
    ['403', new HttpForbiddenError(null), TipoErrorBusqueda.SIN_PERMISO],
    ['400', new ApiError('x', 400, null), TipoErrorBusqueda.SOLICITUD_INVALIDA],
    ['429', new ApiError('x', 429, null), TipoErrorBusqueda.LIMITE],
    ['500', new ApiError('x', 500, null), TipoErrorBusqueda.SERVIDOR],
    ['503', new ApiError('x', 503, null), TipoErrorBusqueda.SERVIDOR],
    ['red (TypeError de fetch)', new TypeError('Failed to fetch'), TipoErrorBusqueda.RED],
  ]

  it.each(casos)('%s → ErrorBusqueda tipado', async (_n, error, tipo) => {
    const repo = new BusquedaHttpRepository(clienteQueFalla(error))
    for (const llamada of [
      () => repo.obtenerFyp(),
      () => repo.buscar(CriteriosBusqueda.vacio().conTexto('ab')),
      () => repo.obtenerCatalogoFiltros(),
    ]) {
      const e = await llamada().catch((x: unknown) => x)
      expect(e).toBeInstanceOf(ErrorBusqueda)
      expect((e as ErrorBusqueda).tipo).toBe(tipo)
    }
  })

  it('usa codigo y mensaje del ErrorDto del cuerpo', async () => {
    const repo = new BusquedaHttpRepository(
      clienteQueFalla(new ApiError('x', 400, { codigo: 'Q_CORTO', mensaje: 'Muy corto' })),
    )
    const e = (await repo.obtenerFyp().catch((x: unknown) => x)) as ErrorBusqueda
    expect(e.codigo).toBe('Q_CORTO')
    expect(e.message).toBe('Muy corto')
  })

  it('propaga la cancelación (AbortError) sin convertirla', async () => {
    const abort = new DOMException('Aborted', 'AbortError')
    const repo = new BusquedaHttpRepository(clienteQueFalla(abort))
    const e = await repo.obtenerFyp().catch((x: unknown) => x)
    expect(e).toBe(abort)
  })

  it('respuesta fuera de contrato → ErrorBusqueda SERVIDOR', async () => {
    const { get } = clienteFalso({ foo: 1 })
    const e = (await new BusquedaHttpRepository({ get }).obtenerFyp().catch((x: unknown) => x)) as ErrorBusqueda
    expect(e).toBeInstanceOf(ErrorBusqueda)
    expect(e.tipo).toBe(TipoErrorBusqueda.SERVIDOR)
  })
})
