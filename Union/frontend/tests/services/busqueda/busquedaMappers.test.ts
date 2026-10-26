import { describe, expect, it } from 'vitest'
import {
  mapearCatalogo,
  mapearError,
  mapearPagina,
  mapearPublicacionResumen,
} from '../../../src/infrastructure/busqueda/busquedaMappers'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'

const dto = (extra: Record<string, unknown> = {}) => ({
  id: 'p1',
  titulo: 'Obra',
  autor: { id: 'a1', nombre: 'Ana' },
  miniaturaUrl: 'https://x/1.jpg',
  tipoContenido: 'IMAGEN',
  estado: 'ACTIVA',
  ...extra,
})

describe('mapearPublicacionResumen', () => {
  it('mapea los campos del contrato', () => {
    const p = mapearPublicacionResumen(dto())
    expect(p.id).toBe('p1')
    expect(p.titulo).toBe('Obra')
    expect(p.autor).toEqual({ id: 'a1', nombre: 'Ana' })
    expect(p.miniaturaUrl).toBe('https://x/1.jpg')
    expect(p.tipoContenido).toBe(TipoContenido.IMAGEN)
    expect(p.estado).toBe(EstadoPublicacion.ACTIVA)
  })

  it('ignora ancho y alto', () => {
    const p = mapearPublicacionResumen(dto({ ancho: 10, alto: 20 })) as unknown as Record<string, unknown>
    expect(p.ancho).toBeUndefined()
    expect(p.alto).toBeUndefined()
  })

  it('no filtra por estado: mapea ELIMINADA tal cual', () => {
    expect(mapearPublicacionResumen(dto({ estado: 'ELIMINADA' })).estado).toBe(
      EstadoPublicacion.ELIMINADA,
    )
  })

  it.each([
    ['null', null],
    ['sin autor', dto({ autor: undefined })],
    ['id numérico', dto({ id: 5 })],
    ['tipoContenido desconocido', dto({ tipoContenido: 'XXX' })],
    ['estado desconocido', dto({ estado: 'otra' })],
  ])('lanza ErrorBusqueda SERVIDOR si %s', (_n, entrada) => {
    try {
      mapearPublicacionResumen(entrada)
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorBusqueda)
      expect((e as ErrorBusqueda).tipo).toBe(TipoErrorBusqueda.SERVIDOR)
      expect((e as ErrorBusqueda).codigo).toBe('RESPUESTA_INVALIDA')
    }
  })
})

describe('mapearPagina', () => {
  it('mantiene el orden recibido y el cursor', () => {
    const pagina = mapearPagina({ items: [dto({ id: 'b' }), dto({ id: 'a' })], cursorSiguiente: 'c2' })
    expect(pagina.items.map((i) => i.id)).toEqual(['b', 'a'])
    expect(pagina.cursorSiguiente).toBe('c2')
    expect(pagina.hayMas).toBe(true)
  })

  it('cursor nulo → sin más resultados', () => {
    const pagina = mapearPagina({ items: [], cursorSiguiente: null })
    expect(pagina.hayMas).toBe(false)
    expect(pagina.estaVacia()).toBe(true)
  })

  it('lanza si falta items o el cursor no es texto', () => {
    expect(() => mapearPagina({ cursorSiguiente: null })).toThrow(ErrorBusqueda)
    expect(() => mapearPagina({ items: [], cursorSiguiente: 3 })).toThrow(ErrorBusqueda)
    expect(() => mapearPagina(null)).toThrow(ErrorBusqueda)
  })
})

describe('mapearCatalogo', () => {
  it('mapea estilos, técnicas y tipos de arte', () => {
    const c = mapearCatalogo({
      estilos: [{ valor: 'a', etiqueta: 'A' }],
      tecnicas: [],
      tiposArte: [{ valor: 't', etiqueta: 'T' }],
    })
    expect(c.estilos).toEqual([{ valor: 'a', etiqueta: 'A' }])
    expect(c.tecnicas).toEqual([])
    expect(c.tiposArte).toEqual([{ valor: 't', etiqueta: 'T' }])
  })

  it('lanza si una lista falta o una opción es inválida', () => {
    expect(() => mapearCatalogo({ estilos: [], tecnicas: [] })).toThrow(ErrorBusqueda)
    expect(() =>
      mapearCatalogo({ estilos: [{ valor: 1 }], tecnicas: [], tiposArte: [] }),
    ).toThrow(ErrorBusqueda)
  })
})

describe('mapearError', () => {
  it.each([
    [null, TipoErrorBusqueda.RED],
    [400, TipoErrorBusqueda.SOLICITUD_INVALIDA],
    [401, TipoErrorBusqueda.NO_AUTENTICADO],
    [403, TipoErrorBusqueda.SIN_PERMISO],
    [429, TipoErrorBusqueda.LIMITE],
    [500, TipoErrorBusqueda.SERVIDOR],
    [503, TipoErrorBusqueda.SERVIDOR],
  ])('estado %s → %s', (estado, tipo) => {
    expect(mapearError(estado).tipo).toBe(tipo)
  })

  it('usa codigo, mensaje y detalles del ErrorDto', () => {
    const e = mapearError(400, { codigo: 'Q_CORTO', mensaje: 'Muy corto', detalles: ['q'] })
    expect(e.codigo).toBe('Q_CORTO')
    expect(e.message).toBe('Muy corto')
    expect(e.detalles).toEqual(['q'])
  })

  it('usa mensaje por defecto sin ErrorDto', () => {
    expect(mapearError(500).message).not.toBe('')
    expect(mapearError(null, null).codigo).toBeUndefined()
  })
})
